import * as eventstore from 'esproto';
import * as net from 'net';
import * as streams from './streams';

import { Observable, Subject, Subscription } from 'rxjs';

import { Command } from './../dist/core.d';
import { Credentials } from './core';

export const backoffStrategies = {
  log: (x: number, interval: number) => Math.min(Math.pow(Math.log10(x * 10), 5), 30) * interval,
  linear: (x: number, interval: number) => x * interval
};

export interface Options {
  host: string;
  port: string | number;
  credentials: Credentials;
  reconnection?: {
    retries: number;
    strategy: keyof typeof backoffStrategies;
    interval: number;
  };
}

export class Client extends streams.StreamProvider {

  public connection: net.Socket;
  public data$: Observable<Buffer>;
  public socket$: Observable<Buffer>;
  public connected$: Observable<boolean>;
  public error$: Observable<Error>;
  public closed$: Observable<void>;
  public write$: Subject<Buffer>;

  private readonly options: Options;
  private reconnectionSubscription: Subscription;

  constructor(options: Options) {
    super();
    this.options = options;
    this.connection = new net.Socket({ allowHalfOpen: false });
    this.connected$ = Observable.fromEvent<boolean>(this.connection, 'connect').share();
    this.socket$ = Observable.fromEvent<Buffer>(this.connection, 'data').share();
    this.error$ = Observable.fromEvent<Error>(this.connection, 'error').share();
    this.closed$ = Observable.fromEvent<void>(this.connection, 'close').share();
    this.data$ = streams.data$(this.socket$).share();
    this.write$ = streams.write$(this.connection);
    this.connect = this.connect.bind(this);
    this._handleHeartbeats = this._handleHeartbeats.bind(this);
    this._handleReconnection = this._handleReconnection.bind(this);
    this._addOutgoingStreams(streams.subjects);
    this._addIncomingStreams(streams.observables);
  }

  public connect() {
    this._handleReconnection();
    this.heartbeatRequestCommand$.subscribe(this._handleHeartbeats);
    this.connection.connect(Number(this.options.port), this.options.host);
  }

  public close() {
    if (this.reconnectionSubscription) {
      this.reconnectionSubscription.unsubscribe();
    }
    this.connection.destroy();
  }

  private _addOutgoingStreams(streams: streams.CommandSubjects) {
    Object.entries(streams).forEach(([ name, stream ]) => (this as any)[ `${name[ 0 ].toLowerCase()}${name.slice(1)}` ] = stream(this.write$, this.options.credentials));
  }

  private _addIncomingStreams(streams: streams.CommandObservables) {
    Object.entries(streams).forEach(([ name, stream ]) => (this as any)[ `${name[ 0 ].toLowerCase()}${name.slice(1)}$` ] = stream(this.data$).share());
  }

  private _handleHeartbeats(command: Command<eventstore.IncomingCodes.HeartbeatRequestCommand>) {
    this.heartbeatResponseCommand(command.id);
  }

  private _handleReconnection() {
    if (this.options.reconnection !== undefined) {
      this.reconnectionSubscription = this.closed$
        .race(this.error$)
        .exhaustMap(() => Observable
          .range(1, this.options.reconnection!.retries)
          .concatMap((i) => {
            return Observable.of(i)
              .delay(backoffStrategies[ this.options.reconnection!.strategy ](i, this.options.reconnection!.interval))
              .do(this.connect)
              .takeUntil(this.connected$);
          }).last()
        ).take(1)
        .subscribe();
    }
  }

}
