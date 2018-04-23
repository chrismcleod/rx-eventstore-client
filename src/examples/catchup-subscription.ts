import { wtfuuid } from 'rx-eventstore-streams';
import { v4 } from 'uuid';

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

  const correlationId = v4();

  const catchup = client.catchup({
    eventStreamId: '$ce-dev_test_shareable',
    fromEventNumber: 10000,
    maxCount: 1000,
    requireMaster: false,
    resolveLinkTos: true,
  }, correlationId);

  // @ts-ignore
  const subscription = catchup.subscribe(event => console.log(event.link!.eventNumber), console.log, () => console.log('completed'));

  setTimeout(() => {
    setInterval(() => {
      client.writeEvents({
        eventStreamId: `dev_test_shareable-${v4()}`,
        expectedVersion: -2,
        requireMaster: false,
        events: [ {
          data: Buffer.from(JSON.stringify({ it: 'doesnt matter' })),
          dataContentType: 1,
          eventId: wtfuuid.write(v4()),
          eventType: 'TestEvent',
          metadataContentType: 0,
        } ],
      });
    }, 3000);
  }, 100);

  /* there are two ways to unsubscribe.  Using rxjs unsubscribe will immediately kill the rxjs subscription
   * as well as cleaning up the eventstore subscription by sending a dropSubscription command.  However, you
   * cannot be notified of completion this way.
   * Unsubscribing by sending the drop subscription command yourself, allows you to be notified if completion.
   */
  setTimeout(() => {
    // subscription.unsubscribe();
    client.unsubscribeFromStream({}, correlationId);
  }, 15000);

  let i = 0;
  setInterval(() => {
    console.log(i);
    i += 1;
  }, 1000);

});
