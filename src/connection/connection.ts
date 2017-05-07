import * as _ from "lodash";

import { ReadAllEventsBackward, ReadAllEventsForward, ReadStreamEventsBackward, ReadStreamEventsForward, WriteEvents, getCommand } from "../command";
import { Socket, connect } from "net";

import { Credentials } from "../authentication";
import { EventStoreSocketStream } from "./event-store-socket-stream";
import { TCPDispatcher } from "../tcp/tcp-dispatcher";

interface Options {
  host?: string;
  port?: number;
  credentials?: Credentials;
  reconnect?: { enabled: boolean, retries?: number };
}

export class Connection {

  private static _defaultOptions = {
    host: "localhost",
    port: 1113,
    reconnect: {
      enabled: true,
      retries: 3
    }
  };

  private _dispatcher: TCPDispatcher;
  private _socket: Socket;
  private _$: EventStoreSocketStream;
  private _currentReconnectionAttempts: number;
  private _options: Options;

  constructor(options?: Options) {
    options = options || {};
    options = _.merge({}, Connection._defaultOptions, options);
    this._options = options;
    this._handleIncomingCommand = this._handleIncomingCommand.bind(this);
    this._currentReconnectionAttempts = 0;
    this._connect();
  }

  public async writeEvents(params: WriteEvents.Params) {
    const command = getCommand(WriteEvents.CODE, params);
    return this._dispatcher.dispatch(command);
  }

  public async readAllEventsBackward(params: ReadAllEventsBackward.Params) {
    const command = getCommand(ReadAllEventsBackward.CODE, params);
    return this._dispatcher.dispatch(command);
  }

  public async readAllEventsForward(params: ReadAllEventsForward.Params) {
    const command = getCommand(ReadAllEventsForward.CODE, params);
    return this._dispatcher.dispatch(command);
  }

  public async readStreamEventsForward(params: ReadStreamEventsForward.Params) {
    const command = getCommand(ReadStreamEventsForward.CODE, params);
    return this._dispatcher.dispatch(command);
  }

  public async readStreamEventsBackward(params: ReadStreamEventsBackward.Params) {
    const command = getCommand(ReadStreamEventsBackward.CODE, params);
    return this._dispatcher.dispatch(command);
  }

  private _handleIncomingCommand(command: any) {
    this._dispatcher.complete(command);
  }

  private _connect() {
    this._currentReconnectionAttempts += 1;
    if (this._socket) this._socket.removeAllListeners();
    this._socket = connect(this._options.port!, this._options.host);
    this._$ = new EventStoreSocketStream(this._socket);
    this._dispatcher = new TCPDispatcher(this._socket, this._options.credentials);
    this._$.command$.subscribe(this._handleIncomingCommand);
    this._socket.on("connect", () => {
      console.log(`Connected after ${this._currentReconnectionAttempts} attempt${this._currentReconnectionAttempts > 1 ? "s" : ""}`);
      this._currentReconnectionAttempts = 0;
    });
    this._socket.on("close", (error) => {
      console.log(`Connection closed ${!!error ? "with" : "without"} error.`);
      if (this._options.reconnect!.enabled && this._currentReconnectionAttempts <= this._options.reconnect!.retries!) this._connect();
    });
    this._socket.on("error", (error) => {
      console.log(error);
    });
  }

}
