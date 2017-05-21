import "colors";

import * as Long from "long";

import { Command, Credentials, commandFromBuffer, commandToBuffer } from "../command";
import { Observable, Subject } from "rxjs";
import { Socket, connect } from "net";

import { CODES } from "../command/codes";
import EventStore from "../eventstore";
import { Message } from "protobufjs";
import { UINT32_LENGTH } from "../constants";
import { v4 } from "uuid";

export class ESPosition {
  public readonly commitPosition: Long;
  public readonly preparePosition: Long;

  constructor(commitPosition: number | Long, preparePosition: number | Long) {
    this.commitPosition = typeof commitPosition === "number" ? Long.fromNumber(commitPosition) : commitPosition;
    this.preparePosition = typeof preparePosition === "number" ? Long.fromNumber(preparePosition) : preparePosition;
  }

  lt(other: ESPosition) {
    return this.commitPosition.lt(other.commitPosition) || (
      this.commitPosition.eq(other.commitPosition) &&
      this.preparePosition.lt(other.preparePosition)
    );
  }

  gt(other: ESPosition) {
    return this.commitPosition.gt(other.commitPosition) || (
      this.commitPosition.eq(other.commitPosition) &&
      this.preparePosition.gt(other.preparePosition)
    );
  }

  eq(other: ESPosition) {
    return this.commitPosition.eq(other.commitPosition) && this.preparePosition.eq(other.preparePosition);
  }

  lte(other: ESPosition) {
    return this.lt(other) || this.eq(other);
  }

  gte(other: ESPosition) {
    return this.gt(other) || this.eq(other);
  }

  ne(other: ESPosition) {
    return !(this.eq(other));
  }
}

export interface CallbackFunctionVariadic {
  (...args: any[]): void;
}

export interface LookupResult {
  err: Error | null;
  address: string;
  family: string | null;
  host: string;
}

export interface Packet {
  packet: Buffer;
  code: number;
  extra: Buffer;
}

export interface ConnectionOptions {
  host: string;
  port: number;
  credentials?: Credentials;
  reconnect?: { enabled: boolean, retries?: number };
}

const defaultConnectionOptions: ConnectionOptions = {
  host: "localhost",
  port: 1113,
  reconnect: {
    enabled: true,
    retries: 5
  }
};

const lookupObjectFactory = (err: Error | null, address: string, family: string | null, host: string) => ({ err, address, family, host });
const filterPacketStream = (packet$: Observable<Packet>, filterCode: number) => (
  packet$
    .filter(({ code }) => code === filterCode)
    .map(({ packet }) => commandFromBuffer(filterCode, packet))
);

const withTimeout = <T>(obs: Observable<T>, call?: CallbackFunctionVariadic, timeout: number = 1000, retries: number = 3) => {
  return obs
    .timeout(timeout)
    .retryWhen((attempts) => Observable
      .range(1, retries + 1)
      .zip(attempts, (i) => i)
      .switchMap((i) => {
        if (i > retries) throw "err";
        const delay = Math.ceil(Math.pow(i, 2 + i / 100));
        return call ? Observable.timer(delay * 1000).do(call) : Observable.timer(delay * 1000);
      })
    );
};

export class Connection {

  public readonly options: ConnectionOptions;
  private _socket: Socket;
  private _close$: Observable<boolean>;
  private _connect$: Observable<void>;
  private _data$: Observable<Buffer>;
  private _drain$: Observable<void>;
  private _end$: Observable<void>;
  private _error$: Observable<Error>;
  private _lookup$: Observable<LookupResult>;
  private _timeout$: Observable<void>;
  private _extra$: Subject<Buffer>;
  private _write$: Subject<Command<any>>;
  private _packet$: Observable<{ packet: Buffer, extra: Buffer, code: number }>;
  private _heartbeat$: Observable<Command<{}>>;
  private _writeEventsCompleted$: Observable<Command<EventStore.WriteEventsCompleted>>;
  private _readStreamEventsForwardCompleted$: Observable<Command<EventStore.ReadStreamEventsCompleted>>;
  private _readStreamEventsBackwardCompleted$: Observable<Command<EventStore.ReadStreamEventsCompleted>>;
  private _readAllEventsForwardCompleted$: Observable<Command<EventStore.ReadAllEventsCompleted>>;
  private _readAllEventsBackwardCompleted$: Observable<Command<EventStore.ReadAllEventsCompleted>>;
  private _subscriptionConfirmation$: Observable<Command<EventStore.SubscriptionConfirmation>>;
  private _subscriptionDropped$: Observable<Command<EventStore.SubscriptionDropped>>;
  private _streamEventAppeared$: Observable<Command<EventStore.StreamEventAppeared>>;
  private _persistentSubscriptionStreamEventAppeared$: Observable<Command<EventStore.PersistentSubscriptionStreamEventAppeared>>;
  private _persistentSubscriptionConfirmation$: Observable<Command<EventStore.PersistentSubscriptionConfirmation>>;
  private _reconnecting: boolean = false;

  constructor(options: ConnectionOptions) {
    this.options = { ...defaultConnectionOptions, ...options };
    this._socket = connect({ host: options.host, port: options.port });
    this._init();
  }

  public get socket() {
    return this._socket;
  }

  public get close$() {
    return this._close$ || (this._close$ = Observable.fromEvent<boolean>(this.socket, "close").share());
  }

  public get connect$() {
    return this._connect$ || (this._connect$ = Observable.fromEvent<void>(this.socket, "connect").share());
  }

  public get data$() {
    return this._data$ || (this._data$ = Observable.fromEvent<Buffer>(this.socket, "data").catch((err) => {
      console.log(err);
      throw err;
    }).share());
  }

  public get drain$() {
    return this._drain$ || (this._drain$ = Observable.fromEvent<void>(this.socket, "drain").share());
  }

  public get end$() {
    return this._end$ || (this._end$ = Observable.fromEvent<void>(this.socket, "end").share());
  }

  public get error$() {
    return this._error$ || (this._error$ = Observable.fromEvent<Error>(this.socket, "error").share());
  }

  public get lookup$() {
    return this._lookup$ || (this._lookup$ = Observable.fromEvent<LookupResult>(this.socket, "lookup", lookupObjectFactory).share());
  }

  public get timeout$() {
    return this._timeout$ || (this._timeout$ = Observable.fromEvent<void>(this.socket, "timeout").share());
  }

  public get extra$() {
    return this._extra$ || (this._extra$ = new Subject<Buffer>());
  }

  public get write$() {
    return this._write$ || (this._write$ = new Subject<Command<any>>());
  }

  public get packet$() {
    return this._packet$ || (
      this._packet$ = this.data$.exhaustMap((segment) => {
        const size = segment.readUInt32LE(0) + UINT32_LENGTH;
        return this.data$
          .startWith(segment)
          .scan((acc, cur) => Buffer.concat([ acc, cur ]))
          .filter((buffer) => buffer.byteLength >= size)
          .map((buffer) => ({ packet: buffer.slice(0, size), code: buffer.readUInt8(UINT32_LENGTH), extra: buffer.slice(size) }))
          .take(1)
      }).do(({ extra }) => this.extra$.next(extra))
    );
  }

  public get heartbeat$() {
    return this._heartbeat$ || (this._heartbeat$ = filterPacketStream(this.packet$, CODES.HeartbeatRequestCommand));
  }

  public get writeEventsCompleted$() {
    return this._writeEventsCompleted$ || (this._writeEventsCompleted$ = filterPacketStream(this.packet$, CODES.WriteEventsCompleted));
  }

  public get readStreamEventsForwardCompleted$() {
    return this._readStreamEventsForwardCompleted$ || (this._readStreamEventsForwardCompleted$ = filterPacketStream(this.packet$, CODES.ReadStreamEventsForwardCompleted));
  }

  public get readStreamEventsBackwardCompleted$() {
    return this._readStreamEventsBackwardCompleted$ || (this._readStreamEventsBackwardCompleted$ = filterPacketStream(this.packet$, CODES.ReadStreamEventsBackwardCompleted));
  }

  public get readAllEventsForwardCompleted$() {
    return this._readAllEventsForwardCompleted$ || (this._readAllEventsForwardCompleted$ = filterPacketStream(this.packet$, CODES.ReadAllEventsForwardCompleted));
  }

  public get readAllEventsBackwardCompleted$() {
    return this._readAllEventsBackwardCompleted$ || (this._readAllEventsBackwardCompleted$ = filterPacketStream(this.packet$, CODES.ReadAllEventsBackwardCompleted));
  }

  public get subscriptionConfirmation$() {
    return this._subscriptionConfirmation$ || (this._subscriptionConfirmation$ = filterPacketStream(this.packet$, CODES.SubscriptionConfirmation));
  }

  public get subscriptionDropped$() {
    return this._subscriptionDropped$ || (this._subscriptionDropped$ = filterPacketStream(this.packet$, CODES.SubscriptionDropped));
  }

  public get streamEventAppeared$() {
    return this._streamEventAppeared$ || (this._streamEventAppeared$ = filterPacketStream(this.packet$, CODES.StreamEventAppeared));
  }

  public get persistentSubscriptionStreamEventAppeared$() {
    return this._persistentSubscriptionStreamEventAppeared$ || (this._persistentSubscriptionStreamEventAppeared$ = filterPacketStream(this.packet$, CODES.PersistentSubscriptionStreamEventAppeared));
  }

  public get persistentSubscriptionConfirmation$() {
    return this._persistentSubscriptionConfirmation$ || (this._persistentSubscriptionConfirmation$ = filterPacketStream(this.packet$, CODES.PersistentSubscriptionConfirmation));
  }

  public writeEvents(params: EventStore.WriteEvents$Properties, id: string = v4()) {
    this.write$.next({ id, code: CODES.WriteEvents, message: new EventStore.WriteEvents(params) });
    return this.writeEventsCompleted$.first((command) => command.id === id);
  }

  public readStreamEventsForward(params: EventStore.ReadStreamEvents$Properties, id: string = v4()) {
    const send = () => this.write$.next({ id, code: CODES.ReadStreamEventsForward, message: new EventStore.ReadStreamEvents(params) });
    send();
    return withTimeout(
      this.readStreamEventsForwardCompleted$.first((command) => command.id === id),
      send
    );
  }

  public readStreamEventsBackward(params: EventStore.ReadStreamEvents$Properties, id: string = v4()) {
    const send = () => this.write$.next({ id, code: CODES.ReadStreamEventsBackward, message: new EventStore.ReadStreamEvents(params) });
    send();
    return withTimeout(
      this.readStreamEventsBackwardCompleted$.first((command) => command.id === id),
      send
    );
  }

  public readAllEventsForward(params: EventStore.ReadAllEvents$Properties, id: string = v4()) {
    const send = () => this.write$.next({ id, code: CODES.ReadAllEventsForward, message: new EventStore.ReadAllEvents(params) });
    send();
    return withTimeout(
      this.readAllEventsForwardCompleted$.first((command) => command.id === id),
      send
    );
  }

  public readAllEventsBackward(params: EventStore.ReadAllEvents$Properties, id: string = v4()) {
    const send = () => this.write$.next({ id, code: CODES.ReadAllEventsBackward, message: new EventStore.ReadAllEvents(params) });
    send();
    return withTimeout(
      this.readAllEventsBackwardCompleted$.first((command) => command.id === id),
      send
    );
  }

  public subscribeToStream(params: EventStore.SubscribeToStream$Properties, id: string = v4()) {
    this.write$.next({ id, code: CODES.SubscribeToStream, message: new EventStore.SubscribeToStream(params) });
    return this.streamEventAppeared$.filter((command) => command.id === id);
  }

  public subscribeToAll(params: Pick<EventStore.SubscribeToStream$Properties, "resolveLinkTos">, id: string = v4()) {
    return this.subscribeToStream({ ...params, eventStreamId: "" }, id);
  }

  public readStreamEventsUntil(params: EventStore.ReadStreamEvents$Properties, toEventNumber: number, id: string = v4()) {
    let done = false;
    return this.readStreamEventsForward(params)
      .expand((command) => {
        const nextParams = { ...params, fromEventNumber: command.message!.nextEventNumber };
        return this.readStreamEventsForward(nextParams);
      })
      .takeWhile((command) => {
        const shouldTake = !done && command.message!.nextEventNumber - params.maxCount <= toEventNumber;
        done = command.message!.isEndOfStream;
        return shouldTake;
      })
      .concatMap((command) => {
        return Observable.from(command.message!.events).filter((event) => {
          if (event.link) return event.link.eventNumber <= toEventNumber;
          if (event.event) return event.event.eventNumber <= toEventNumber;
          return true;
        });
      })
  }

  public readAllEventsUntil(params: EventStore.ReadAllEvents$Properties, toPosition: ESPosition, id: string = v4()) {
    let done = false;
    return this.readAllEventsForward(params)
      .expand((command) => {
        const nextParams = { ...params, commitPosition: command.message!.nextCommitPosition, preparePosition: command.message!.nextPreparePosition };
        return this.readAllEventsForward(nextParams);
      })
      .takeWhile((command) => {
        const nextPosition = new ESPosition(command.message!.nextCommitPosition, command.message!.nextPreparePosition);
        const shouldTake = !done && nextPosition.lt(toPosition);
        done = command.message!.nextCommitPosition === -1 || command.message!.nextPreparePosition === -1;
        return shouldTake;
      })
      .concatMap((command) => {
        return Observable.from(command.message!.events).filter((event) => {
          const e = event.link ? event.link : event.event;
          const eventPosition = new ESPosition(event.commitPosition, event.preparePosition);
          return eventPosition.lte(toPosition);
        });
      })
  }

  public subscribeToStreamFrom(params: EventStore.ReadStreamEvents$Properties, id: string = v4()) {
    const catchupComplete = new Subject();
    const subscription = this.subscribeToStream(params, id);
    const stream1 = this.subscriptionConfirmation$
      .first((command) => command.id === id)
      .switchMap((command) => {
        return this.readStreamEventsUntil(params, command.message!.lastEventNumber);
      })
      .share();
    stream1.subscribe(undefined, undefined, () => catchupComplete.next() && catchupComplete.complete());
    const stream2 = Observable.concat(
      subscription
        .buffer(catchupComplete)
        .first()
        .switchMap((bufferedStreamEventAppearedEvents) => {
          return bufferedStreamEventAppearedEvents.length === 0
            ? Observable.empty()
            : Observable.from(bufferedStreamEventAppearedEvents).map((command) => command.message!.event);
        }),
      subscription.map((command) => command.message!.event)
    );
    return Observable.merge(stream1, stream2);
  }

  public subscribeToAllFrom(params: EventStore.ReadAllEvents$Properties, id: string = v4()) {
    const catchupComplete = new Subject();
    const subscription = this.subscribeToAll(params, id);
    const stream1 = this.subscriptionConfirmation$
      .first((command) => command.id === id)
      .switchMap((command) => {
        return this.readAllEventsUntil(params, new ESPosition(command.message!.lastCommitPosition, 0));
      })
      .share();
    stream1.subscribe(undefined, undefined, () => catchupComplete.next() && catchupComplete.complete());
    const stream2 = Observable.concat(
      subscription
        .buffer(catchupComplete)
        .first()
        .switchMap((bufferedStreamEventAppearedEvents) => {
          return bufferedStreamEventAppearedEvents.length === 0
            ? Observable.empty()
            : Observable.from(bufferedStreamEventAppearedEvents).map((command) => command.message!.event);
        }),
      subscription.map((command) => command.message!.event)
    );
    return Observable.merge(stream1, stream2);
  }

  public connectToPersistentSubscription(params: EventStore.ConnectToPersistentSubscription$Properties, id: string = v4()) {
    this.write$.next({ id, code: CODES.ConnectToPersistentSubscription, message: new EventStore.ConnectToPersistentSubscription(params) });
    this.subscriptionDropped$.subscribe(console.log);
    this.persistentSubscriptionConfirmation$.subscribe(console.log);
    return this.persistentSubscriptionStreamEventAppeared$.filter((command) => {
      return command.id === id;
    });
  }

  public ack(subscriptionId: string, event: EventStore.ResolvedIndexedEvent, id: string) {
    const params: EventStore.PersistentSubscriptionAckEvents$Properties = {
      subscriptionId,
      processedEventIds: [ event.link ? event.link.eventId : event.event!.eventId ]
    };
    this.write$.next({ id, code: CODES.PersistentSubscriptionAckEvents, message: new EventStore.PersistentSubscriptionAckEvents(params) });
  }

  public nak(events: EventStore.PersistentSubscriptionNakEvents$Properties, id: string = v4()) {
    this.write$.next({ id, code: CODES.PersistentSubscriptionNakEvents, message: new EventStore.PersistentSubscriptionNakEvents(events) });
  }

  public readEvent(params: EventStore.ReadEvent$Properties, id = v4()) {
    this.write$.next({ id, code: CODES.ReadEvent, message: new EventStore.ReadEvent(params) });
    return filterPacketStream(this.packet$, CODES.ReadEventCompleted).filter((command) => command.id === id);
  }

  public startTransaction(params: EventStore.TransactionStart$Properties, id = v4()) {
    this.write$.next({ id, code: CODES.TransactionStart, message: new EventStore.TransactionStart(params) });
    return filterPacketStream(this.packet$, CODES.TransactionStartCompleted).filter((command) => command.id === id);
  }

  public continueTransaction(params: EventStore.TransactionWrite$Properties, id = v4()) {
    this.write$.next({ id, code: CODES.TransactionWrite, message: new EventStore.TransactionWrite(params) });
    return filterPacketStream(this.packet$, CODES.TransactionWriteCompleted).filter((command) => command.id === id);
  }

  public commitTransaction(params: EventStore.TransactionCommit$Properties, id = v4()) {
    this.write$.next({ id, code: CODES.TransactionCommit, message: new EventStore.TransactionCommit(params) });
    return filterPacketStream(this.packet$, CODES.TransactionCommitCompleted).filter((command) => command.id === id);
  }

  public deleteStream(params: EventStore.DeleteStream$Properties, id = v4()) {
    this.write$.next({ id, code: CODES.DeleteStream, message: new EventStore.DeleteStream(params) });
    return filterPacketStream(this.packet$, CODES.DeleteStreamCompleted).filter((command) => command.id === id);
  }

  private _init() {
    let heartCounter = 0;
    const hearts = [ "❤️".red, "❤️".green, "❤️".yellow, "❤️".blue, "❤️".magenta, "❤️".cyan ];
    this.write$.catch((err) => {
      console.log(err);
      return Observable.of(err);
    }).subscribe((command) => {
      if (command.code === CODES.HeartbeatResponseCommand) this.socket.write(command.message);
      else this.socket.write(commandToBuffer(command, this.options.credentials));
    });
    this.heartbeat$.subscribe((command) => {
      if (command.encoded) {
        (<any>process.stdout).clearLine();
        (<any>process.stdout).cursorTo(0);
        (<any>process.stdout).write(hearts[ heartCounter++ ]);
        if (heartCounter > 5) heartCounter = 0;
        const message = Buffer.concat([ Buffer.alloc(0), command.encoded ]);
        message.writeUInt8(CODES.HeartbeatResponseCommand, 4);
        this.write$.next({ id: command.id, code: CODES.HeartbeatResponseCommand, message });
      }
    });

    this._socket.on("close", this._reconnectionHandler.bind(this));
  }

  private _reconnectionHandler(hadError: boolean) {
    if (this._reconnecting) return;
    this._reconnecting = true;
    let reconnectionAttempts = 0;
    console.info(`Connection closed ${hadError ? "with" : "without"} error.`);
    if (this.options.reconnect!.enabled && reconnectionAttempts <= this.options.reconnect!.retries!) {
      const errorHandler = () => {
        console.info(`Failed to reconnect after ${reconnectionAttempts} of ${this.options.reconnect!.retries} attempt${this.options.reconnect!.retries! > 1 ? "s" : ""}`);
        if (reconnectionAttempts === this.options.reconnect!.retries!) {
          clearInterval(interval);
          this._reconnecting = false;
          throw new Error("Could not reconnect");
        }
      }
      const connectedHandler = () => {
        console.info(`Reconnected after ${reconnectionAttempts} attempt${reconnectionAttempts > 1 ? "s" : ""}`);
        this._reconnecting = false;
        this._socket.removeListener("error", errorHandler);
        clearInterval(interval);
      }
      this._socket.on("error", errorHandler);
      this._socket.once("connect", connectedHandler);
      const interval = setInterval(() => {
        reconnectionAttempts += 1;
        this._socket.connect(this.options.port, this.options.host);
      }, 5000);
    }
  }

}

export const connection = (options: ConnectionOptions) => new Connection(options);
