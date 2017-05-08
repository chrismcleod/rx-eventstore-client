import * as Rx from "rxjs";

import { Command, Heartbeat, getCommand } from "../command";
import { TCPPackage, UINT32_LENGTH } from "../tcp";

import { Socket } from "net";

export class EventStoreSocketStream {

  private _socket: Socket;
  private _data$: Rx.Observable<Buffer>;
  private _heartbeat$: Rx.Observable<Buffer>;
  private _command$: Rx.Observable<Command<number>>;
  private _extra$: Rx.Subject<Buffer>;
  private _error$: Rx.Subject<Buffer>;

  constructor(socket: Socket) {
    this._socket = socket;
    this._respondToHeartbeat = this._respondToHeartbeat.bind(this);
    this._extra$ = new Rx.Subject<Buffer | null>();
    this._error$ = new Rx.Subject<Buffer | null>();
    [this._data$, this._heartbeat$] = Rx.Observable
      .merge(Rx.Observable.fromEvent<Buffer>(this._socket, "data").share(), this._extra$.share())
      .partition((buffer) => {
        const code = buffer.readUInt8(4);
        return code !== Heartbeat.HEARTBEAT_REQUEST && code !== Heartbeat.HEARTBEAT_RESPONSE;
      });
    this._heartbeat$.subscribe(this._respondToHeartbeat);
  }

  get error$() {
    return this._error$;
  }

  get data$() {
    return this._data$;
  }

  public get command$() {
    if (this._command$) {
      return this._command$;
    }
    const data$ = this.data$;
    const extra$ = this._extra$;
    this._command$ = data$
      .switchMap((latestBuffer: Buffer) => {
        return Rx.Observable
          .of(latestBuffer)
          .exhaustMap((buffer: Buffer) => {
            const size = buffer.readUInt32LE(0) + UINT32_LENGTH;
            return data$
              .startWith(buffer)
              .scan((acc, cur) => Buffer.concat([acc, cur]), Buffer.alloc(0))
              .filter((accumulatedBuffer) => accumulatedBuffer.byteLength >= size)
              .map((completedBuffer) => {
                let extra;
                if (completedBuffer.byteLength > size) {
                  extra = completedBuffer.slice(size);
                }
                return { buffer: completedBuffer.slice(0, size), extra };
              })
              .take(1);
          })
          .map((completed) => {
            const tcpPackage = TCPPackage.fromBuffer(completed.buffer);
            try {
              const command = getCommand(tcpPackage.code as any, tcpPackage.message, tcpPackage.correlationId);
              return command;
            } catch (error) {
              throw error;
            } finally {
              if (completed.extra) {
                extra$.next(completed.extra);
              }
            }
          })
          .catch((err) => {
            this._error$.next(err);
            return Rx.Observable.empty();
          });
      })
      .share();
    return this._command$;
  }

  private _respondToHeartbeat(buffer: Buffer) {
    buffer.writeUInt8(Heartbeat.HEARTBEAT_RESPONSE, 4);
    this._socket.write(buffer);
  }

}
