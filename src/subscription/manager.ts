import * as Commands from "../command/index";
import * as Rx from "rxjs";
import * as _ from "lodash";

export type StreamId = string;
export type NextObserver = (value: Commands.StreamEventAppeared.Command) => void;
export type StreamObserver = Rx.Subscriber<Commands.StreamEventAppeared.Command> | NextObserver | Array<NextObserver>;
export interface Stream extends Rx.Observable<Commands.StreamEventAppeared.Command> { }
export interface Streams { [ key: string ]: Stream; }
export interface Subscriptions { [ key: string ]: Rx.Subscription; }

export class Manager {

  private _source: Stream;
  private _streams: Streams = {};
  private _subscriptions: Subscriptions = {};

  constructor(stream: Stream) {
    this._source = stream;
    this._filterStreamEventAppearedCommand = this._filterStreamEventAppearedCommand.bind(this);
  }

  public isSubscribed(streamId: StreamId) {
    return !!this._subscriptions[ streamId ];
  }

  public subscribe(streamId: StreamId, observer: StreamObserver) {
    const stream = this._ensureStream(streamId);
    if (Array.isArray(observer)) observer = _.flow<NextObserver>(...observer);
    if (typeof observer === "function") observer = Rx.Subscriber.create(observer);
    this._subscriptions[ streamId ].add(stream.subscribe(observer));
  }

  private _ensureStream(streamId: StreamId) {
    if (this.isSubscribed(streamId)) return this._streams[ streamId ];
    this._streams[ streamId ] = this._source.filter(this._filterStreamEventAppearedCommand(streamId));
    this._addObserver(streamId, new Rx.Subscriber(() => { /* no op */ }));
    return this._streams[ streamId ];
  }

  private _filterStreamEventAppearedCommand(streamId: string) {
    return (command: Commands.StreamEventAppeared.Command) => {
      if (command.message.event.link) return command.message.event.link.eventStreamId === streamId;
      if (command.message.event.event) return command.message.event.event.eventStreamId === streamId;
      return false;
    };
  }

  private _addObserver(streamId: StreamId, observer: Rx.Subscriber<Commands.StreamEventAppeared.Command>) {
    return this._subscriptions[ streamId ] = this._streams[ streamId ].subscribe(observer);
  }

}
