import * as Commands from "../command";
import * as Rx from "rxjs";
import * as Subscription from "../subscription";
import * as _ from "lodash";

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
  private _subscriptionManager: Subscription.Manager;

  constructor(options?: Options) {
    options = options || {};
    options = _.merge({}, Connection._defaultOptions, options);
    this._options = options;
    this._handleIncomingCommand = this._handleIncomingCommand.bind(this);
    this._currentReconnectionAttempts = 0;
    this._connect();
  }

  public async writeEvents(params: Commands.WriteEvents.Params) {
    const command = Commands.getCommand(Commands.WriteEvents.CODE, params);
    return this._dispatcher.dispatch(command);
  }

  public async readAllEventsBackward(params: Commands.ReadAllEventsBackward.Params) {
    const command = Commands.getCommand(Commands.ReadAllEventsBackward.CODE, params);
    return this._dispatcher.dispatch(command);
  }

  public async readAllEventsForward(params: Commands.ReadAllEventsForward.Params) {
    const command = Commands.getCommand(Commands.ReadAllEventsForward.CODE, params);
    return this._dispatcher.dispatch(command);
  }

  public async readStreamEventsForward(params: Commands.ReadStreamEventsForward.Params) {
    const command = Commands.getCommand(Commands.ReadStreamEventsForward.CODE, params);
    return this._dispatcher.dispatch(command);
  }

  public async readStreamEventsBackward(params: Commands.ReadStreamEventsBackward.Params) {
    const command = Commands.getCommand(Commands.ReadStreamEventsBackward.CODE, params);
    return this._dispatcher.dispatch(command);
  }

  public async subscribeToStream(params: Commands.SubscribeToStream.Params, observer?: Subscription.StreamObserver) {
    if (this._subscriptionManager.isSubscribed(params.eventStreamId)) {
      if (observer) this._subscriptionManager.subscribe(params.eventStreamId, observer);
      return true;
    }
    const command = Commands.getCommand(Commands.SubscribeToStream.CODE, params);
    const result = await this._dispatcher.dispatch(command);
    if (result.id === Commands.SubscriptionConfirmation.CODE) {
      if (observer) this._subscriptionManager.subscribe(params.eventStreamId, observer);
      return true;
    }
    return false;
  }

  private _handleIncomingCommand(command: Commands.Command) {
    this._dispatcher.complete(command);
  }

  private _connect() {
    this._currentReconnectionAttempts += 1;
    if (this._socket) this._socket.removeAllListeners();
    this._socket = connect(this._options.port!, this._options.host);
    this._$ = new EventStoreSocketStream(this._socket);
    this._dispatcher = new TCPDispatcher(this._socket, this._options.credentials);
    this._$.command$.subscribe(this._handleIncomingCommand, console.log, console.log);
    this._subscriptionManager = new Subscription.Manager(this._$.command$.filter((command) => command.id === Commands.StreamEventAppeared.CODE));
    this._$.error$.subscribe(console.log);
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
