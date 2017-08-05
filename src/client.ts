import * as eventstore from 'esproto';
import * as net from 'net';
import * as streams from './streams';

import { Observable, Subject } from 'rxjs';

import { Command } from './../dist/core.d';
import { Credentials } from './core';

export interface Options {
  host: string;
  port: string | number;
  credentials: Credentials;
}

export class Client extends streams.StreamProvider {

  public connection: net.Socket;
  public data$: Observable<Buffer>;
  public socket$: Observable<Buffer>;
  public connected$: Observable<boolean>;
  public write$: Subject<Buffer>;

  private options: Options;

  constructor(options: Options) {
    super();
    this.options = options;
    this.connection = new net.Socket({ allowHalfOpen: false });
    this.connected$ = Observable.fromEvent<boolean>(this.connection, 'connect').share();
    this.socket$ = Observable.fromEvent<Buffer>(this.connection, 'data').share();
    this.data$ = streams.data$(this.socket$).share();
    this.write$ = streams.write$(this.connection);
    this._handleHeartbeats = this._handleHeartbeats.bind(this);
    this._addOutgoingStreams(streams.subjects);
    this._addIncomingStreams(streams.observables);
  }

  public connect() {
    this.heartbeatRequestCommand$.subscribe(this._handleHeartbeats);
    this.connection.connect(Number(this.options.port), this.options.host);
  }

  public close() {
    this.connection.destroy();
  }

  private _addOutgoingStreams(streams: streams.CommandSubjects) {
    Object.entries(streams).forEach(([ name, stream ]) => (this as any)[ `${name[ 0 ].toLowerCase()}${name.slice(1)}` ] = stream(this.write$, this.options.credentials));
  }

  private _addIncomingStreams(streams: streams.CommandObservables) {
    Object.entries(streams).forEach(([ name, stream ]) => (this as any)[ `${name[ 0 ].toLowerCase()}${name.slice(1)}$` ] = stream(this.data$).share());
  }

  /* istanbul ignore next */
  private _handleHeartbeats(command: Command<eventstore.IncomingCodes.HeartbeatRequestCommand>) {
    this.heartbeatResponseCommand(command.id);
  }

}
