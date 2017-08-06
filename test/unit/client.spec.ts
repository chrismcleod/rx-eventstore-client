import '..';

import * as eventstore from 'esproto';

import { Client } from '../../src/client';
import { toBuffer } from '../../src/commands';
import { v4 } from 'uuid';

describe('client', function () {

  let sandbox: sinon.SinonSandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('provides command subjects', function () {
    const id = v4();
    const spy = sandbox.spy(client.write$, 'next');
    client.ping(id);
    expect(spy.calledOnce).to.eql(true);
  });

  it('provides command observables', async function () {
    const id = v4();
    const promise = client.pong$.first().toPromise();
    const buffer = toBuffer(eventstore.IncomingCodes.Pong, undefined, id);
    client.connection.emit('data', buffer);
    const result = await promise;
    expect(result.code).to.eql(eventstore.IncomingCodes.Pong);
  });

  it('adds an incremental timeout operator with a linear backoff strategy', function () {
    let c = 0;
    const promise = client.pong$.incrementalRetry(1, 3, 1, (command) => {
      c++;
      return command;
    }).first().toPromise();
    return promise.catch(() => {
      expect(c).to.eql(3);
    });
  });

  it('adds an incremental timeout operator with a user-defeind backoff strategy', function () {
    const backoff = (i: number) => Math.PI * (Math.sqrt(i));
    let c = 0;
    const promise = client.pong$.incrementalRetry(1, 3, backoff, (command) => {
      c++;
      return command;
    }).first().toPromise();
    return promise.catch(() => {
      expect(c).to.eql(3);
    });
  });

  it('adds an incremental timeout operator that defaults to three retries', function () {
    let c = 0;
    const promise = client.pong$.incrementalRetry(1, undefined, 1, (command) => {
      c++;
      return command;
    }).first().toPromise();
    return promise.catch(() => {
      expect(c).to.eql(3);
    });
  });

  it('adds an incremental timeout operator that works without a callback', function () {
    const promise = client.pong$.incrementalRetry(1, 1, 1).first().toPromise();
    return promise.catch(() => {
      expect(true).to.eql(true);
    });
  });

  it('adds an incremental timeout operator that works with a custom backoff but without a callback', function () {
    const promise = client.pong$.incrementalRetry(1, 1, (i) => i).first().toPromise();
    return promise.catch(() => {
      expect(true).to.eql(true);
    });
  });

  it('adds a forCommand operator to filter streams for correlation ids', async function () {
    const id = v4();
    let c = 0;
    const promise = client.pong$.do(() => c++).forCommand(id).first().toPromise();
    const buffer1 = toBuffer(eventstore.IncomingCodes.Pong);
    const buffer2 = toBuffer(eventstore.IncomingCodes.Pong, undefined, id);
    client.connection.emit('data', buffer1);
    client.connection.emit('data', buffer2);
    const result = await promise;
    expect(c).to.eql(2);
    expect(result.id).to.eql(id);
  });

  it('attempts to reconnect if the connection is unexpectedly closed using a linear strategy', async function () {
    const client = new Client({ host: (global as any).server.address().address, port: process.env.PORT || 3000, credentials: { username: 'admin', password: 'changeit' }, reconnection: { retries: 2, strategy: 'linear', interval: 1 } });
    client.connect();
    let connected = client.connected$.first().toPromise();
    await connected;
    const spy = sandbox.spy(client, 'connect');
    sandbox.stub(client.connection, 'connect').callsFake(() => false);
    client.connection.destroy();
    await new Promise((res) => setTimeout(res, 20));
    expect(spy.callCount).to.eql(2);
  });

  it('attempts to reconnect if the connection is unexpectedly closed using a logarithmic strategy', async function () {
    const client = new Client({ host: (global as any).server.address().address, port: process.env.PORT || 3000, credentials: { username: 'admin', password: 'changeit' }, reconnection: { retries: 2, strategy: 'log', interval: 1 } });
    client.connect();
    let connected = client.connected$.first().toPromise();
    await connected;
    const spy = sandbox.spy(client, 'connect');
    sandbox.stub(client.connection, 'connect').callsFake(() => false);
    client.connection.destroy();
    await new Promise((res) => setTimeout(res, 20));
    expect(spy.callCount).to.eql(2);
  });

  it('does not attempt to reconnect if close is called manually', async function () {
    const client = new Client({ host: (global as any).server.address().address, port: process.env.PORT || 3000, credentials: { username: 'admin', password: 'changeit' }, reconnection: { retries: 2, strategy: 'log', interval: 1 } });
    client.connect();
    let connected = client.connected$.first().toPromise();
    await connected;
    const spy = sandbox.spy(client, 'connect');
    sandbox.stub(client.connection, 'connect').callsFake(() => false);
    client.close();
    await new Promise((res) => setTimeout(res, 20));
    expect(spy.callCount).to.eql(0);
  });

  it('can disconnect and reconnect manually', async function () {
    const client = new Client({ host: (global as any).server.address().address, port: process.env.PORT || 3000, credentials: { username: 'admin', password: 'changeit' }, reconnection: { retries: 2, strategy: 'log', interval: 1 } });
    client.connect();
    let connected = client.connected$.first().toPromise();
    await connected;
    let disconnected = client.closed$.first().toPromise();
    client.close();
    await disconnected;
    connected = client.connected$.first().toPromise();
    client.connect();
    await connected;
    client.close();
    expect(true).to.eql(true);
  });

  it('can disconnect and reconnect manually then will resume automatic reconnecting', async function () {
    const client = new Client({ host: (global as any).server.address().address, port: process.env.PORT || 3000, credentials: { username: 'admin', password: 'changeit' }, reconnection: { retries: 2, strategy: 'log', interval: 1 } });

    let connected = client.connected$.first().toPromise();
    let disconnected = client.closed$.first().toPromise();
    client.connect();
    await connected;
    client.close();
    await disconnected;

    connected = client.connected$.first().toPromise();
    disconnected = client.closed$.first().toPromise();
    client.connect();
    await connected;
    client.close();
    await disconnected;

    connected = client.connected$.first().toPromise();
    disconnected = client.closed$.first().toPromise();
    client.connect();
    await connected;
    client.close();
    await disconnected;

    connected = client.connected$.first().toPromise();
    client.connect();
    const spy = sandbox.spy(client, 'connect');
    sandbox.stub(client.connection, 'connect').callsFake(() => false);
    client.connection.destroy();
    await new Promise((res) => setTimeout(res, 20));
    expect(spy.callCount).to.eql(2);
  });

  it('handles heartbeats', async function () {
    const spy = sandbox.spy(client, 'heartbeatResponseCommand');
    const promise = client.heartbeatRequestCommand$.first().toPromise();
    const buffer = toBuffer(eventstore.IncomingCodes.HeartbeatRequestCommand);
    client.connection.emit('data', buffer);
    await promise;
    expect(spy.callCount).to.eql(1);
  });
});
