import { Command, ReadAllEventsBackward, ReadAllEventsBackwardCompleted, ReadAllEventsForward, ReadAllEventsForwardCompleted, ReadStreamEventsBackward, ReadStreamEventsBackwardCompleted, WriteEvents, WriteEventsCompleted } from "../command";

import { Credentials } from "../authentication";
import { Socket } from "net";
import { TCPPackage } from "./tcp-package";

export class TCPDispatcher {

  private _credentials?: Credentials;
  private _promises: { [key: string]: ResolverRejector<Command<any>> };
  private _socket: Socket;

  constructor(socket: Socket, credentials?: Credentials) {
    this._credentials = credentials;
    this._promises = {};
    this._socket = socket;
  }

  public async dispatch(command: WriteEvents.Command): Promise<WriteEventsCompleted.Command>;
  public async dispatch(command: ReadStreamEventsBackward.Command): Promise<ReadStreamEventsBackwardCompleted.Command>;
  public async dispatch(command: ReadAllEventsBackward.Command): Promise<ReadAllEventsBackwardCompleted.Command>;
  public async dispatch(command: ReadAllEventsForward.Command): Promise<ReadAllEventsForwardCompleted.Command>;
  public async dispatch(command: any) {
    const instance = this;
    return new Promise((resolve, reject) => {
      try {
        this._promises[command.key] = { resolve, reject };
        const tcpPackage = this.encode(command);
        const buffer = tcpPackage.toBuffer();
        instance._socket.write(buffer);
      } catch (err) {
        reject(err);
      }
    });
  }

  public encode(command: any) {
    return new TCPPackage({
      code: command.id,
      correlationId: command.correlationId,
      credentials: this._credentials,
      flag: this._credentials ? 1 : 0,
      message: command.encoded
    });
  }

  public complete(command: Command<any>) {
    const resolverRejector = this._promises[command.key];
    if (resolverRejector) resolverRejector.resolve(command);
  }

}
