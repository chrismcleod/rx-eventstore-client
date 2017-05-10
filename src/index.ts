import "long";

import * as faker from "faker";

import { SubscriptionDropped, getCommand } from "./command";

import { Connection } from "./connection/connection";
import { ExpectedVersion } from "./event";
import { Position } from "./command/command";
import { parse } from "uuid-parse";
import { v4 } from "uuid";

// tslint:disable-next-line:no-namespace
declare global {
  export type UUID = string;
  interface ResolverRejector<T> {
    resolve: (value?: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
  }
}

const data = [];
for (let i = 0; i < 500; ++i) {
  data.push(faker.helpers.userCard());
}

const eventData = data.map((e) => ({
  data: Buffer.from(JSON.stringify(e)),
  dataContentType: 1,
  eventId: parse(v4()) as any as Buffer,
  eventType: "CreateUser",
  metadata: Buffer.alloc(0),
  metadataContentType: 1
}));

// process.nextTick(async () => {
//   for (const event of eventData) {
//     await connection.writeEvents({
//       eventStreamId: `user-${v4()}`,
//       events: [ event ],
//       expectedVersion: ExpectedVersion.Any,
//       requireMaster: false
//     });
//   }
// });

const connection = new Connection({ host: "192.168.99.100", credentials: { username: "admin", password: "changeit" } });
process.nextTick(async () => {

  await connection.subscribeToStream({
    eventStreamId: "$ce-user",
    resolveLinkTos: true
  }, (command) => {
    console.log("handler 1", command.key);
  });

  await connection.subscribeToStream({
    eventStreamId: "$ce-user",
    resolveLinkTos: true
  }, (command) => {
    console.log("handler 2", command.key);
  });

  await connection.subscribeToStream({
    eventStreamId: "$ce-user",
    resolveLinkTos: true
  }, [ (command) => {
    console.log("handler 3", command.key);
    return command;
  }, (command) => {
    console.log("handler 4", command.key);
    return command;
  }]);

});

let cursor = 0;
setInterval(() => {
  console.log("Creating user...");
  connection.writeEvents({
    eventStreamId: `user-${v4()}`,
    events: [ eventData[ cursor++ ] ],
    expectedVersion: ExpectedVersion.Any,
    requireMaster: false
  });
}, 1000);

// setTimeout(() => {
//   console.log("dropping");
//   const command = getCommand(SubscriptionDropped.CODE, { reason: 0 }, sid);
//   connection._$._util$.next(command);
// }, 2000);
