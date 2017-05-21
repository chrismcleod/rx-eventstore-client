import * as Long from "long";

import { CODES } from "./command/codes";
import EventStore from "./eventstore";
import { connection } from "./stream";
import { parse } from "uuid-parse";
import { v4 } from "uuid";

const $ = connection({ host: "192.168.99.100", port: 1113, credentials: { username: "admin", password: "changeit" } });

// setInterval(() => {
//   $.writeEvents({
//     eventStreamId: `user-${v4()}`,
//     expectedVersion: -2,
//     events: [ {
//       eventId: Buffer.from(parse(v4())),
//       eventType: "CreateUser",
//       dataContentType: 1,
//       metadataContentType: 1,
//       data: Buffer.from(JSON.stringify({ a: "b" })),
//       metadata: Buffer.from("{}")
//     }],
//     requireMaster: false
//   }).subscribe((e) => console.log(e));
// }, 1000);

// $.subscribeToAllFrom({
//   commitPosition: Long.fromBits(16978866, 0),
//   preparePosition: 0,
//   maxCount: 100,
//   requireMaster: false,
//   resolveLinkTos: true
// }).subscribe((event) => console.log(event), console.log, () => console.log("completez"));

// $.subscribeToStreamFrom({
//   eventStreamId: "$ce-user",
//   fromEventNumber: 0,
//   maxCount: 100,
//   requireMaster: false,
//   resolveLinkTos: true
// }).subscribe((event) => console.log(event), console.log, () => console.log("completez"));

// $.connectToPersistentSubscription({
//   eventStreamId: "$ce-user",
//   subscriptionId: "users",
//   allowedInFlightMessages: 100
// }).subscribe((command) => {
//   console.log(command);
//   $.ack("$ce-user::users", command.message.event, command.id);
// }, console.log, () => console.log("completez"));

// $.readEvent({
//   eventStreamId: "$ce-user",
//   eventNumber: 117,
//   resolveLinkTos: true,
//   requireMaster: false
// }).subscribe(console.log);

// $.startTransaction({
//   eventStreamId: "user-test",
//   expectedVersion: -2,
//   requireMaster: false
// }).switchMap((command) => {
//   const transactionId = command.message.transactionId;
//   const events = [ {
//     eventId: Buffer.from(parse(v4())),
//     eventType: "CreateUser",
//     dataContentType: 1,
//     metadataContentType: 1,
//     data: Buffer.from(JSON.stringify({ a: "b" })),
//     metadata: Buffer.from("{}")
//   }];
//   return $.continueTransaction({
//     events,
//     transactionId,
//     requireMaster: false
//   }).switchMap((command) => {
//     return $.commitTransaction({
//       transactionId,
//       requireMaster: false
//     });
//   });
// }).subscribe(console.log);

$.deleteStream({
  eventStreamId: "user-test",
  expectedVersion: -2,
  requireMaster: false
}).subscribe(console.log);