// tslint:disable
import { Client } from './client';
import { parse } from 'uuid-parse';
import { v4 } from 'uuid';

const makeEvents = (count: number) => {
  const events = [];
  for (let i = 0; i < count; ++i) {
    events.push({
      data: Buffer.from(JSON.stringify({ key: 'value' })),
      dataContentType: 1,
      eventId: parse(v4()),
      eventType: 'Test',
      metadata: Buffer.alloc(100, 1),
      metadataContentType: 0
    });
  }
  return events;
};

const TEST_STREAM = 'rxeventstoreclienttests-tests-eb61d1f9-a0cc-4e96-ba35-d0160339898c';
const TEST_SUBSCRIPTION = `rxeventstoreclienttests-tests-${v4()}`;
const client = new Client({ host: '192.168.99.100', port: 1113, credentials: { username: 'admin', password: 'changeit' } });

client.connected$.subscribe(() => {

  client.writeEvents({ eventStreamId: TEST_STREAM, events: makeEvents(5), expectedVersion: -2, requireMaster: false });

  client.writeEventsCompleted$.first().subscribe(() => {
    const readEventCorrelationId = v4();
    const sendReadEventCommand = () => client.readEvent({ eventNumber: 0, eventStreamId: TEST_STREAM, requireMaster: false, resolveLinkTos: true }, readEventCorrelationId);

    // filter the stream by a particular correlation id.  If you only expect one response (i.e. ReadStreamEventCompleted), you can chain this with the first operator
    client.readEventCompleted$.forCommand(readEventCorrelationId).first().subscribe((command) => console.log('ReadEvent Completed', command.id), console.log);

    // waits 1 second for a command completion to arrive, then retries 3 times each time increasing the time between retries by our custom function and retrying the command
    client.readStreamEventsBackwardCompleted$.incrementalRetry(1000, 3, (retryNumber) => retryNumber * Math.sqrt(retryNumber), sendReadEventCommand);

    client.readStreamEventsForwardCompleted$.subscribe((command) => console.log('ReadStreamEventsForwardCompleted', command.id), console.log, console.log);
    client.readAllEventsForwardCompleted$.subscribe((command) => console.log('ReadAllEventsForwardCompleted', command.id), console.log, console.log);
    client.readAllEventsBackwardCompleted$.subscribe((command) => console.log('ReadAllEventsBackwardCompleted', command.id), console.log, console.log);
    client.writeEventsCompleted$.subscribe((command) => console.log('WriteEventsCompleted', command.id), console.log, console.log);

    // only take the first two stream events
    client.streamEventAppeared$.take(2).subscribe((command) => console.log('StreamEventAppeared', command.id), console.log, console.log);

    sendReadEventCommand();
    client.readStreamEventsBackward({ eventStreamId: TEST_STREAM, fromEventNumber: -1, maxCount: 100, requireMaster: false, resolveLinkTos: true });
    client.readStreamEventsForward({ eventStreamId: TEST_STREAM, fromEventNumber: 0, maxCount: 100, requireMaster: false, resolveLinkTos: true });
    client.readAllEventsForward({ commitPosition: 0, preparePosition: 0, maxCount: 100, requireMaster: false, resolveLinkTos: true });
    client.readAllEventsBackward({ commitPosition: 0, preparePosition: -1, maxCount: 100, requireMaster: false, resolveLinkTos: true });
    client.writeEvents({ eventStreamId: TEST_SUBSCRIPTION, events: makeEvents(5), expectedVersion: -2, requireMaster: false });
    client.subscribeToStream({ eventStreamId: TEST_SUBSCRIPTION, resolveLinkTos: true });
    client.writeEvents({ eventStreamId: TEST_SUBSCRIPTION, events: makeEvents(5), expectedVersion: -2, requireMaster: false });

  });

});

client.connect();
setTimeout(() => client.close(), 5000);
