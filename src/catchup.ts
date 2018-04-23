import long from 'long';
import { Observer } from 'rxjs';
import { Observable } from 'rxjs/Observable';

import { SUBSCRIPTION_DROPPED, default as ES, lookupCode } from 'esproto';

// @ts-ignore
import { Client, Credentials, Event } from 'rx-eventstore-streams';

import { PartialClient } from '.';

const isLong = (obj: any): obj is Long => {
  return long.isLong(obj);
};

export type ICatchup = ES.IReadStreamEvents & ES.ISubscribeToStream;

export const catchup = (client: PartialClient) => (data: ICatchup, correlationId?: string, credentials?: Credentials) => {

  if (data.maxCount > 4096) throw new Error('When reading streams, maxCount must be less than 4097');
  if (data.eventStreamId === '$all' || data.eventStreamId === '') throw new Error('Catch-up subscription on the $all stream is not supported');

  const subscription = client.subscribeToStream({
    eventStreamId: data.eventStreamId,
    resolveLinkTos: data.resolveLinkTos,
  }, correlationId, credentials);

  const live = subscription.onEvent
    .map(event => event.data.event)
    .shareReplay();

  return subscription.onComplete.switchMap((completion) => {

    const request = (fromEventNumber: number | Long) => client.readStreamEventsForward({
      fromEventNumber,
      eventStreamId: data.eventStreamId,
      maxCount: Math.min(4096, data.maxCount),
      requireMaster: data.requireMaster,
      resolveLinkTos: data.resolveLinkTos,
    }, correlationId, credentials);

    const readForward = request(data.fromEventNumber)
      .expand((batch) => {
        if (isLong(batch.data.nextEventNumber)) {
          if (batch.data.nextEventNumber && batch.data.nextEventNumber.lte(completion.data.lastEventNumber!)) {
            return request(batch.data.nextEventNumber);
          }
        } else if (isLong(completion.data.lastEventNumber)) {
          if (batch.data.nextEventNumber && completion.data.lastEventNumber.gt(batch.data.nextEventNumber)) {
            return request(batch.data.nextEventNumber);
          }
        } else {
          if (batch.data.nextEventNumber && batch.data.nextEventNumber <= completion.data.lastEventNumber!) {
            return request(batch.data.nextEventNumber);
          }
        }
        return Observable.empty();
      })
      .switchMap(batch => Observable.from(batch.data.events || []));

    const historical = readForward.share();

    const subscriptionDropped = client.adapter.$
      .filter((value) => {
        return value.correlationId === completion.correlationId &&
          value.code === lookupCode(SUBSCRIPTION_DROPPED);
      }).first();

    return Observable.create((observer: Observer<ES.IResolvedEvent | ES.IResolvedIndexedEvent>) => {
      Observable.concat(historical, live)
        .takeUntil(subscriptionDropped)
        .subscribe(event => observer.next(event));
      return () => {
        client.unsubscribeFromStream({}, correlationId);
      };
    })
      .takeUntil(subscriptionDropped)
      .share();

  });

};
