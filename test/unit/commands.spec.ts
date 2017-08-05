import '..';

import * as eventstore from 'esproto';

import { incomingBuffers, outgoingBuffers, toBuffer, toBufferWithMessage } from '../../src/commands';

describe('outgoing buffers', function () {

  it('creates a buffer without a message', function () {
    const buffer = outgoingBuffers.Ping();
    expect(buffer).to.be.instanceOf(Buffer);
  });

  it('creates a buffer with a message', function () {
    const buffer = outgoingBuffers.ReadEvent({ eventNumber: 0, eventStreamId: 'a', requireMaster: false, resolveLinkTos: true });
    expect(buffer).to.be.instanceOf(Buffer);
  });

  it('creates a buffer with credentials', function () {
    const credentials = { username: 'apples', password: 'oranges' };
    const bufferWithoutCredentials = outgoingBuffers.ReadEvent({ eventNumber: 0, eventStreamId: 'a', requireMaster: false, resolveLinkTos: true });
    const bufferWithCredentials = outgoingBuffers.ReadEvent({ eventNumber: 0, eventStreamId: 'a', requireMaster: false, resolveLinkTos: true }, undefined, credentials);
    const credentialsLength = Buffer.byteLength(credentials.username + credentials.password) + 2;
    expect(bufferWithCredentials).to.be.instanceOf(Buffer);
    expect(bufferWithCredentials.byteLength - bufferWithoutCredentials.byteLength).to.eql(credentialsLength);
  });

});

describe('incoming buffers', function () {

  it('creates a command without a message', function () {
    const buffer = toBuffer(eventstore.IncomingCodes.Pong);
    const command = incomingBuffers.Pong(buffer);
    expect(command.code).to.be.eql(eventstore.IncomingCodes.Pong);
  });

  it('creates a command with a message', function () {
    const message = fixtures.ReadEventCompleted$Properties;
    const buffer = toBufferWithMessage(eventstore.ReadEventCompleted, eventstore.IncomingCodes.ReadEventCompleted, message);
    const command = incomingBuffers.ReadEventCompleted(buffer);
    expect(command.code).to.be.eql(eventstore.IncomingCodes.ReadEventCompleted);
    expect(command.message.event).not.to.eql(undefined);
  });

});
