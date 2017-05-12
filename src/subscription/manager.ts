import * as Commands from "../command/index";
import * as Rx from "rxjs";

interface Subscription {
  appeared$: Rx.Observable<Commands.StreamEventAppeared.Command>;
  dropped$: Rx.Observable<Commands.SubscriptionDropped.Command>;
  streamId: string;
  correlationId: string;
  appearedSubscription: Rx.Subscription;
  droppedSubscription: Rx.Subscription;
  observers: Array<Rx.Observer<Commands.StreamEventAppeared.Command>>;
}

export type Observer = Subscription[ "observers" ] | Subscription[ "observers" ][ number ];

const correlatedStream = (correlationId: string) => (command: { correlationId: string }) => {
  return command.correlationId === correlationId;
};

export class Manager {

  private _appeared$: Subscription[ "appeared$" ];
  private _dropped$: Subscription[ "dropped$" ];

  private _subscriptions: { [ key: string ]: Subscription } = {};

  public set sources(streams: Pick<Subscription, "appeared$" | "dropped$">) {
    this._appeared$ = streams.appeared$;
    this._dropped$ = streams.dropped$;
  }

  public get streamIds() {
    return Object.keys(this._subscriptions);
  }

  public getCorrelationId(streamId: string) {
    return this._subscriptions[ streamId ].correlationId;
  }

  public isSubscribed(streamId: string) {
    return !!this._subscriptions[ streamId ];
  }

  public addSubscription(streamId: string, correlationId?: string, observers?: Observer) {
    if (this._subscriptions[ streamId ]) return this._addObserversToSubscription(streamId, observers);
    if (correlationId) return this._addNewSubscription(streamId, correlationId, observers);
    return;
  }

  public removeSubscription(streamId: string) {
    let correlationId: string;
    if (this._subscriptions[ streamId ]) {
      correlationId = this._subscriptions[ streamId ].correlationId;
      this._subscriptions[ streamId ].appearedSubscription.unsubscribe();
      this._subscriptions[ streamId ].droppedSubscription.unsubscribe();
      delete this._subscriptions[ streamId ];
      return correlationId;
    }
    return;
  }

  public resetSubscriptions(keys: Array<{ streamId: string, correlationId: string }>) {
    keys.forEach((key) => {
      this._rebuildSubscriptionsWithNewCorrelationId(key.streamId, key.correlationId);
    });
  }

  private _addNewSubscription(streamId: string, correlationId: string, observers?: Subscription[ "observers" ] | Subscription[ "observers" ][ number ]) {
    const dropped$ = this._dropped$.filter<Commands.SubscriptionDropped.Command>(correlatedStream(correlationId));
    const appeared$ = this._appeared$.filter<Commands.StreamEventAppeared.Command>(correlatedStream(correlationId)).takeUntil(dropped$);
    const appearedSubscription = appeared$.subscribe();
    const droppedSubscription = dropped$.subscribe(() => this.removeSubscription(streamId));
    this._subscriptions[ streamId ] = {
      appeared$,
      dropped$,
      streamId,
      correlationId,
      appearedSubscription,
      droppedSubscription,
      observers: []
    };
    return this._addObserversToSubscription(streamId, observers);
  }

  private _addObserversToSubscription(streamId: string, observers?: Subscription[ "observers" ] | Subscription[ "observers" ][ number ]) {
    const subscription = this._subscriptions[ streamId ];
    if (!observers) return subscription;
    observers = ([] as Subscription[ "observers" ]).concat(observers);
    observers.forEach((observer) => subscription.appearedSubscription.add(subscription.appeared$.subscribe(observer)));
    subscription.observers = subscription.observers.concat(observers);
    return subscription;
  }

  private _rebuildSubscriptionsWithNewCorrelationId(streamId: string, correlationId: string) {
    this._addNewSubscription(streamId, correlationId, this._subscriptions[ streamId ].observers);
  }

}
