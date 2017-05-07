import "long";

import * as faker from "faker";

import { Connection } from "./connection/connection";
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

// const data = [];
// for (let i = 0; i < 500; ++i) {
//   data.push(faker.helpers.userCard());
// }

const connection = new Connection({ host: "192.168.99.100", credentials: { username: "admin", password: "changeit" } });

// const eventData = data.map((e) => ({
//   data: Buffer.from(JSON.stringify(e)),
//   dataContentType: 1,
//   eventId: parse(v4()) as any as Buffer,
//   eventType: "CreateUser",
//   metadata: Buffer.alloc(0),
//   metadataContentType: 1
// }));

// process.nextTick(async () => {
//   for (let event of events) {
//     const result = await connection.writeEvents({
//       eventStreamId: `user-${v4()}`,
//       events: [event],
//       expectedVersion: ExpectedVersion.Any,
//       requireMaster: false
//     });
//   }
// });

process.nextTick(async () => {
  let len = 100;
  let events: Array<any> = [];
  let pos = 0;
  while (len >= 100) {
    const result = await connection.readStreamEventsForward({
      eventStreamId: "user-4562b02d-33f2-40c2-9074-23b9e1cc99bd",
      fromEventNumber: 0,
      maxCount: 100,
      requireMaster: false,
      resolveLinkTos: true
    });
    if (result.message && result.message.events) events = events.concat(result.message.events);
    len = result.message.events.length;
    pos += 100;
    console.log(result.message.events[0].event.data.toString("utf8"));
  }
});
