import * as Commands from "../command";
import * as Rx from "rxjs";
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
  private _subscriptions: { [key: string]: Rx.Observable<Commands.StreamEventAppeared.Command> };
  private _existingStreams: { [key: string]: Commands.SubscriptionConfirmation.Command };

  constructor(options?: Options) {
    options = options || {};
    options = _.merge({}, Connection._defaultOptions, options);
    this._options = options;
    this._subscriptions = {};
    this._existingStreams = {};
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

  public async subscribeToStream(params: Commands.SubscribeToStream.Params, observer?: Commands.StreamEventAppeared.SubscriptionObserver) {
    const existingSubscriptionConfirmation = this._existingStreams[params.eventStreamId];
    if (existingSubscriptionConfirmation) {
      if (observer) this.addSubscriptionObserver(existingSubscriptionConfirmation.key, observer);
      return existingSubscriptionConfirmation;
    }
    const command = Commands.getCommand(Commands.SubscribeToStream.CODE, params);
    const result = await this._dispatcher.dispatch(command);
    if (result.id === Commands.SubscriptionConfirmation.CODE) {
      this._existingStreams[params.eventStreamId] = result;
      this._createSubscriptionStreamFromConfirmation(result);
      if (observer) this.addSubscriptionObserver(result.key, observer);
    }
    return result;
  }

  public async addSubscriptionObserver(subscriptionId: string, observer: Commands.StreamEventAppeared.SubscriptionObserver) {
    if (Array.isArray(observer)) observer = this._flattenOrderedObserver(observer);
    this._subscriptions[subscriptionId].subscribe(observer);
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
    this._$.command$.subscribe(this._handleIncomingCommand, console.log, console.log);
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

  private _createSubscriptionStreamFromConfirmation(confirmationCommand: Commands.SubscriptionConfirmation.Command) {
    this._subscriptions[confirmationCommand.key] = this._$.command$.filter((command) => {
      return command.id === Commands.StreamEventAppeared.CODE && command.correlationId === confirmationCommand.correlationId;
    }).share();
    return this._subscriptions[confirmationCommand.key];
  }

  private _flattenOrderedObserver<T extends Commands.Command<any, any>>(observers: Commands.StreamEventAppeared.OrderedObserver) {
    return (event: T) => {
      observers.forEach(async (observer) => await observer(event));
    };
  }

}
