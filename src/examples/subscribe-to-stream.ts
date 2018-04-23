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

  const subscription = client.subscribeToStream({
    eventStreamId: 'my-stream',
    resolveLinkTos: true,
  });

  subscription.onComplete.subscribe((completion) => {
    console.log(completion.data.lastEventNumber);
  });

  subscription.onEvent.subscribe((operation) => {
    console.log(operation.data.event.event);
    console.log(operation.data.event.link);
    client.unsubscribeFromStream();
  });


});
