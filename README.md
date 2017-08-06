# Rx EventStore Client

[![Build Statme](https://travis-ci.org/chrismcleod/rx-eventstore-client.svg?branch=develop)](https://travis-ci.org/chrismcleod/rx-eventstore-client)
[![Code Climate](https://img.shields.io/codeclimate/coverage/github/chrismcleod/rx-eventstore-client.svg)](https://codeclimate.com/github/chrismcleod/rx-eventstore-client/coverage?sort=covered_percent&sort_direction=desc)
[![Code Climate](https://img.shields.io/codeclimate/github/chrismcleod/rx-eventstore-client.svg)](https://codeclimate.com/github/chrismcleod/rx-eventstore-client)
[![bitHound](https://img.shields.io/bithound/dependencies/github/chrismcleod/rx-eventstore-client.svg)](https://www.bithound.io/github/chrismcleod/rx-eventstore-client)

An [eventstore](http://geteventstore.com) client using rxjs 5 streams.

## Installation

using **[npm](https://travis-ci.org/chrismcleod/rx-eventstore-client)**

```bash
npm i rx-eventstore-client
```

using **[yarn](https://yarnpkg.com/en/)**

```bash
yarn add rx-eventstore-client
```

## Usage
An example file is included, to run it:

using **[npm](https://travis-ci.org/chrismcleod/rx-eventstore-client)**

```bash
npm run example
```

using **[yarn](https://yarnpkg.com/en/)**

```bash
yarn example
```

### Example
```typescript
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
const client = new Client({
  host: '192.168.99.100',
  port: 1113,
  credentials: { username: 'admin', password: 'changeit' },
  reconnection: {
    retries: 5,
    strategy: 'log', // logarithmic backoff interval between reconnection attempts up to a max of 30 seconds
    interval: 1000
  }
});

client.connected$.subscribe(() => {
  console.log('connected');
  client.notHandled$.subscribe(() => console.log('not handled'))
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

```

## Contributing

### Branch Organization

I will do my best to keep master in good shape, with tests passing at all times. But in order to move fast, I will make API changes that your application might not be compatible with. I will do my best to communicate these changes and version appropriately so you can lock into a specific version if need be.

### Bugs

**Where to Find Known Issues**

I am meing GitHub Issues for my public bugs. Before filing a new task, try to make sure your problem doesn't already exist.

Questions and feature requests will be tracked here for now:

* Have a question? mee the Question label.
* Have a feature request? mee the Feature Request label.

**Reporting New Issues**

The best way to get a bug fixed is to provide a reduced test case. Please provide a public repository with a runnable example.

Please report a single bug per issue. Always provide reproduction steps. If the bug cannot be reproduced, verify that the issue can be reproduced locally by targeting the latest release. Ideally, check if the issue is present in master as Ill.

Do not forget to include sample code that reproduces the issue. Only open issues for bugs affecting either the latest stable release, or the current release candidate, or master. If it is not clear from your report that the issue can be reproduced in one of these releases, your issue will be closed.

I'm not able to provide support through GitHub Issues. If you're looking for help with your code, consider asking on Stack Overflow.

### Proposing a Change

If you intend to change the public API, or make any non-trivial changes to the implementation, I recommend filing an issue. This lets me reach an agreement on your proposal before you put significant effort into it.

If you're only fixing a bug, it's fine to submit a pull request right away but I still recommend to file an issue detailing what you're fixing. This is helpful in case I don't accept that specific fix but want to keep track of the issue.

### Pull Requests

If you send a pull request, please do it against the master branch. I maintain stable branches for stable releases separately but I don't accept pull requests to them directly. Instead, I cherry-pick non-breaking changes from master to the latest stable version.

I will be monitoring for pull requests. For API changes I may need to fix internal issues, which could cause some delay. I'll do my best to provide updates and feedback throughout the process.

Small pull requests are much easier to review and more likely to get merged. Make sure the PR does only one thing, otherwise please split it.

Before submitting a pull request, please make sure the following is done…

1. Fork the repo and create your branch from master.
1. Describe your test plan in your commit.
1. Make sure your code lints meing the tslint rules provided.
1. Squash your commits (git rebase -i). One intent alongside one commit makes it clearer for people to review and easier to understand your intention.
Note: It is not necessary to keep clicking Merge master to your branch on the PR page. You would want to merge master if there are conflicts or tests are failing.

#### Test plan

A good test plan has the exact commands you ran and their output.

* If you've added code that should be tested, add tests!
* If you've changed APIs, update the documentation.
* See "What is a Test Plan?" to learn more: https://medium.com/@martinkonicek/what-is-a-test-plan-8bfc840ec171#.y9lcuqqi9

### Performance
Each test cycle is performed by sending a single command with data of size indicated.  i.e. Writing 10 events sends a single write events command with an array of 10 events in the data buffer.

Cycles are continuomely executed for 5 seconds for each test.

Metrics recorded meing benchmark.js and microtime for timing.

*4 GHz Intel Core i7 ~ 40 GB RAM ~ 3TB SSD ~ single node process*<br/>
*Last Updated: July 15th, 2017*

| Test Name                                                      | ops/sec | evts/sec    | std         | samples |
| -------------------------------------------------------------- | ------- | ----------- | ----------- | ------- |
| Writing 1 event                                                | 1,501   | 1,501       | ±2.77%      | 74      |
| Writing 10 events                                              | 1,492   | 14,920      | ±2.01%      | 73      |
| Writing 100 events                                             | 1,167   | 116,717     | ±1.92%      | 79      |
| **Writing 1000 events**                                        | **280** | **280,344** | **±13.31%** | 75      |
| Writing 10000 events                                           | 12.73   | 127,336     | ±24.68%     | 37      |
| Reading 1 events from $all stream                              | 2,993   | 2,993       | ±3.13%      | 75      |
| Reading 10 events from $all stream                             | 2,271   | 22,715      | ±3.51%      | 75      |
| **Reading 100 events from $all stream**                        | **825** | **82,531**  | **±2.44%**  | **73**  |
| Reading 1000 events from $all stream                           | 54.42   | 54,417      | ±2.35%      | 66      |
| Reading 4096 (max) events from $all stream                     | 12.26   | 50,205      | ±3.84%      | 60      |
| Reading 1 events from stream with ten thousand events          | 2,877   | 2,877       | ±4.80%      | 75      |
| Reading 10 events from stream with ten thousand events         | 2,358   | 23,579      | ±1.60%      | 76      |
| Reading 100 events from stream with ten thousand events        | 1,024   | 102,357     | ±2.87%      | 79      |
| **Reading 1000 events from stream with ten thousand events**   | **143** | **142,717** | **±3.49%**  | **68**  |
| Reading 4096 (max) events from stream with ten thousand events | 35.33   | 144,708     | ±2.42%      | 59      |

### License

By contributing to rx-eventstore-client, you agree that your contributions will be licensed under its MIT license.

------------------------------------------------------------------------------------------------------------------------