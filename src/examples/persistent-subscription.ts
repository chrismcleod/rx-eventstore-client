import { default as createClient } from '..';

setImmediate(async () => {
  const client = await createClient({
    host: process.env.ES_HOST!,
    port: 1113,
    credentials: {
      username: process.env.ES_USERNAME!,
      password: process.env.ES_PASSWORD!,
    },
  });

  client.createPersistentSubscription({
    bufferSize: 500,
    checkpointAfterTime: 5000 /* five seconds */,
    checkpointMaxCount: 500,
    checkpointMinCount: 10,
    eventStreamId: '$ce-mycategory',
    liveBufferSize: 500,
    maxRetryCount: 10,
    messageTimeoutMilliseconds: 300000 /* five minutes */,
    namedConsumerStrategy: 'Round Robin',
    preferRoundRobin: true,
    readBatchSize: 20,
    recordStatistics: true,
    resolveLinkTos: true,
    startFrom: 0,
    subscriberMaxCount: 10,
    subscriptionGroupName: 'my-subscription-group',
  }).map(() => client.connectToPersistentSubscription({
    allowedInFlightMessages: 10,
    eventStreamId: '$ce-mycategory',
    subscriptionId: 'my-subscription-group',
  })).subscribe((subscription) => {
    subscription.onComplete.subscribe(e => console.log(e));
    subscription.onEvent.subscribe((event) => {
      client.persistentSubscriptionAckEvents({
        processedEventIds: [ event.data.event.link!.eventId ],
        subscriptionId: '$ce-mycategory::my-subscription-group',
      }, event.correlationId);
    });
  });


});
