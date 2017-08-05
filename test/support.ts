// tslint:disable
import * as _fixtures from './fixtures';
import * as _sinon from 'sinon';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as lodash from 'lodash';
import * as sinonChai from 'sinon-chai';

import { Client } from './../src/client';
import { createServer } from 'net';

chai.use(sinonChai);
chai.use(chaiAsPromised);

declare global {
  const expect: typeof chai.expect;
  const sinon: typeof _sinon;
  const fixtures: typeof _fixtures;
  const client: Client;
  const _: typeof lodash;
}

before(function () {
  (global as any).server = createServer((socket) => (global as any).serverSocket = socket);
  return new Promise((res) => {
    (global as any).server.listen(process.env.PORT || 3000, () => {
      (global as any).client = new Client({ host: (global as any).server.address().address, port: process.env.PORT || 3000, credentials: { username: 'admin', password: 'changeit' } });
      (global as any).client.connected$.first().subscribe(res);
      (global as any).client.connect();
    });
  });
});

after(function () {
  (global as any).server.close();
  (global as any).client.close();
});
