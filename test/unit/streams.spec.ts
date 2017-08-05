import '..';

import * as eventstore from 'esproto';

import { data$, observables, subjects } from '../../src/streams';
import { toBuffer, toBufferWithMessage } from '../../src/commands';

import { Subject } from 'rxjs';
import { esBuffers } from '../helpers/buffers';
import { marbles } from 'rxjs-marbles';
import { v4 } from 'uuid';

describe('command subjects', function () {

  let sandbox: sinon.SinonSandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('creates a subject for commands without messages', function () {
    const id = v4();
    const subject = new Subject<Buffer>();
    const spy = sandbox.spy(subject, 'next');
    const commandSubject = subjects.Ping(subject);
    commandSubject(id);
    expect(spy.calledOnce).to.eql(true);
  });

  it('creates a subject for commands with messages', function () {
    const id = v4();
    const subject = new Subject<Buffer>();
    const spy = sandbox.spy(subject, 'next');
    const commandSubject = subjects.ReadEvent(subject);
    const command = { eventNumber: 0, eventStreamId: 'a', requireMaster: false, resolveLinkTos: true };
    const commandBuffer = toBufferWithMessage(eventstore.ReadEvent, eventstore.OutgoingCodes.ReadEvent, command, undefined, id);
    commandSubject(command, id);
    expect(spy).to.have.been.calledWith(commandBuffer);
  });
});

describe('command observables', function () {

  let sandbox: sinon.SinonSandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('creates an observable for commands without messages', async function () {
    const id = v4();
    const subject = new Subject<Buffer>();
    const commandObservable = observables.Pong(subject);
    const promise = commandObservable.first().toPromise();
    const buffer = toBuffer(eventstore.IncomingCodes.Pong, undefined, id);
    subject.next(buffer);
    const result = await promise;
    expect(result.code).to.eql(eventstore.IncomingCodes.Pong);
  });

  it('creates an observable for commands with messages', async function () {
    const id = v4();
    const subject = new Subject<Buffer>();
    const commandObservable = observables.ReadEventCompleted(subject);
    const promise = commandObservable.first().toPromise();
    const message = fixtures.ReadEventCompleted$Properties;
    const buffer = toBufferWithMessage(eventstore.ReadEventCompleted, eventstore.IncomingCodes.ReadEventCompleted, message, undefined, id);
    subject.next(buffer);
    const result = await promise;
    expect(result.code).to.eql(eventstore.IncomingCodes.ReadEventCompleted);
    expect(result.message.event.event).not.to.eql(undefined);
  });
});

describe('data stream', function () {

  it('parses incoming hot data stream', marbles((m) => {
    const subs = [];
    const { spread: s } = esBuffers(2, 5, [ 1, 2 ], 'KB', [ 9, 10 ]);
    const source = /*********/m.hot('^-a-b-c-d-e-', { a: s[ 0 ], b: s[ 1 ], c: s[ 2 ], d: s[ 3 ], e: s[ 4 ] });
    const expected = /*******/m.hot('^-----a---b-', { a: 1, b: 2 });
    subs[ 0 ] = /******************/'^-----------';
    subs[ 1 ] = /******************/'--^---!-----';
    subs[ 2 ] = /******************/'------^---!-';

    const destination = data$(source).map((value) => value.readUInt8(4));
    m.expect(destination).toBeObservable(expected);
    m.expect(source).toHaveSubscriptions(subs);
  }));

});
