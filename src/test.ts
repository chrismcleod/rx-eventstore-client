import { parse, unparse, v4 } from "node-uuid";

import { EventStore } from "./eventstore";
import { connect } from "net";

const connection = connect({ port: 1113, host: "192.168.99.100" }, () => {

  const read = (from: number) => {
    readTimeout = setTimeout(() => {
      console.log("Read timedout retrying...")
      read(from);
    }, 1000);
    console.log(`Reading from ${from}...`);
    const message = EventStore.ReadStreamEvents.create({
      eventStreamId: "$ce-user",
      fromEventNumber: from,
      maxCount: 10,
      resolveLinkTos: true,
      requireMaster: false
    });

    const encoded = EventStore.ReadStreamEvents.encode(message).finish() as Buffer;

    const auth = Buffer.alloc(15);
    auth.writeUInt8(5, 0);
    auth.write("admin", 1);
    auth.writeUInt8(8, 6);
    auth.write("changeit", 7);

    const packet = Buffer.alloc(22 + encoded.length + auth.length);
    packet.writeUInt32LE(18 + encoded.length + auth.length, 0);
    packet.writeUInt8(0xB2, 4);
    packet.writeUInt8(1, 5);
    v4(undefined, packet, 6);
    auth.copy(packet, 22, 0);
    encoded.copy(packet, 37, 0);

    if (connection.writable) {
      connection.write(packet, () => {
        console.log("Sent Read...");
      });
    }
  }

  const write = (data: any) => {
    console.log("Writing...");
    const message = EventStore.WriteEvents.create({
      eventStreamId: `user-${v4()}`,
      expectedVersion: -2,
      events: [ {
        eventId: Buffer.from(v4()),
        eventType: "CreateUser",
        dataContentType: 1,
        metadataContentType: 1,
        data: Buffer.from(JSON.stringify({ a: "b" })),
        metadata: Buffer.from("{}")
      }],
      requireMaster: false
    });

    const encoded = EventStore.WriteEvents.encode(message).finish() as Buffer;

    const auth = Buffer.alloc(15);
    auth.writeUInt8(5, 0);
    auth.write("admin", 1);
    auth.writeUInt8(8, 6);
    auth.write("changeit", 7);

    const packet = Buffer.alloc(22 + encoded.length + auth.length);
    packet.writeUInt32LE(18 + encoded.length + auth.length, 0);
    packet.writeUInt8(0x82, 4);
    packet.writeUInt8(1, 5);
    v4(undefined, packet, 6);
    auth.copy(packet, 22, 0);
    encoded.copy(packet, 37, 0);

    if (connection.writable) {
      connection.write(packet, () => {
        console.log("Sent write...");
      });
    }
  }

  let buff: Buffer = Buffer.alloc(0);
  let size: number | null = null;
  let readTimeout: number;

  connection.on("data", (buffer) => {
    console.log(buffer);
    if (size === null) size = buffer.readUInt32LE(0);
    buff = Buffer.concat([ buff, buffer ]);
    if (buff.byteLength < size) return;
    const code = buff.readUInt8(4);
    if (code === 0x01) {
      buffer.writeUInt8(0x02, 4);
      connection.write(buffer);
    } else if (code === 0xB3) {
      if (readTimeout) clearTimeout(readTimeout);
      const key = unparse(buff, 6);
      const response = EventStore.ReadStreamEventsCompleted.decode(buff.slice(22));

      if (!response.isEndOfStream) read(response.nextEventNumber);
    }
    buff = Buffer.alloc(0);
    size = null;
  });
  read(0);
  const int = setInterval(write, 100);
  setTimeout(() => clearInterval(int), 10000);
});
