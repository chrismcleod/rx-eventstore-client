import { Connection, ESPosition, connection } from "../../src/stream/connection";

import { CODES } from "../../src/command/codes";
import EventStore from "../../src/eventstore";
import { ExpectedVersion } from "../../src/command";
import { Observable } from "rxjs";
import { parse } from "uuid-parse";
import { v4 } from "uuid";

const TEST_CATEGORY = `rxeventstoreclienttests`;
const TEST_EVENT_NAMESPACE = "testevent";

let $: Connection;
const testid = () => `${TEST_CATEGORY}-tests-${v4()}`;
const event = (data?: any) => ({
  eventId: Buffer.from(parse(`${TEST_EVENT_NAMESPACE}-${v4()}`)),
  eventType: "TestEvent",
  dataContentType: 1,
  metadataContentType: 0,
  data: Buffer.from(JSON.stringify(data || { key: "value" }))
});

const pass: any = (cb: any) => {
  return () => {
    expect(true).toBe(true);
    cb();
  };
};

const passWithCode = (code: number, cb: any) => {
  return (response: any) => {
    try {
      expect(response.code).toEqual(code);
      expect(response.message.result).toEqual(EventStore.OperationResult.Success);
      cb();
    } catch (err) {
      cb.fail(err);
    }
  };
};

const passWithDataDefault = (response: any, data: any, cb: any) => {
  try {
    expect(response.message.result).toEqual(EventStore.OperationResult.Success);
    if (Array.isArray(data)) {
      expect(Array.isArray(response.message.events)).toBe(true);
      expect(response.message.events.length).toEqual(data.length);
      data.forEach((eventData: any, index) => expect(JSON.parse(response.message.events[ index ].event.data.toString())).toMatchObject(eventData));
    } else {
      expect(JSON.parse(response.message.events[ 0 ].event.data.toString())).toMatchObject(data);
    }
    cb();
  } catch (err) {
    cb.fail(err);
  }
};

const passWithDataStreamEventAppeared = (response: any, data: any, cb: any) => {
  try {
    expect(JSON.parse(response.message.event.event.data.toString())).toMatchObject(data);
    cb();
  } catch (err) {
    cb.fail(err);
  }
};

const passWithData = (data: any, cb: any, subscriptionId?: string, c?: Connection) => {
  return (response: any) => {
    if (subscriptionId && c) {
      c.unsubscribeFromStream(subscriptionId).subscribe((r) => {
        c.close();
        switch (response.code) {
          case CODES.StreamEventAppeared: return passWithDataStreamEventAppeared(response, data, cb);
          default: return passWithDataDefault(response, data, cb);
        }
      });
    } else {
      switch (response.code) {
        case CODES.StreamEventAppeared: return passWithDataStreamEventAppeared(response, data, cb);
        default: return passWithDataDefault(response, data, cb);
      }
    }
  };
};

describe("stream/connection", function () {

  beforeAll(function () {
    $ = connection({ host: "192.168.99.100", port: 1113, credentials: { username: "admin", password: "changeit" } });
  });

  afterAll(function () {
    // $.close();
  });

  it("connects", function (done) {
    $.ping().subscribe(pass(done), done.fail);
  });

  // it("emits close events on the close$", function (done) {
  //   const con = connection({ host: "192.168.99.100", port: 1113, credentials: { username: "admin", password: "changeit" } });
  //   con.close$.subscribe(pass(done), done.fail);
  //   con.connect$.subscribe(() => con.close());
  // });

  // it("writes events", function (done) {
  //   $.writeEvents({
  //     eventStreamId: testid(),
  //     expectedVersion: ExpectedVersion.Any,
  //     requireMaster: false,
  //     events: [ event() ]
  //   }).subscribe(passWithCode(CODES.WriteEventsCompleted, done), done.fail);
  // });

  describe("reading", function () {

    let eventStreamId: any;
    let first: any;
    let mid: any;
    let last: any;

    beforeEach(function (done) {
      eventStreamId = testid();
      first = { first: "first" };
      mid = { mid: "mid" };
      last = { last: "last" };
      $.writeEvents({
        eventStreamId,
        expectedVersion: ExpectedVersion.Any,
        requireMaster: false,
        events: [ event(first), event(mid), event(last) ]
      }).subscribe(done);
    });

    //   it("reads stream events forward", function (done) {
    //     $.readStreamEventsForward({
    //       eventStreamId,
    //       fromEventNumber: 0,
    //       maxCount: 3,
    //       resolveLinkTos: true,
    //       requireMaster: false
    //     }).subscribe(passWithData([ first, mid, last ], done), done.fail);
    //   });

    //   it("reads stream events backward", function (done) {
    //     $.readStreamEventsBackward({
    //       eventStreamId,
    //       fromEventNumber: 2,
    //       maxCount: 3,
    //       resolveLinkTos: true,
    //       requireMaster: false
    //     }).subscribe(passWithData([ last, mid, first ], done), done.fail);
    //   });

    //   it("reads stream events until a specified event number", function (done) {
    //     const s = $.readStreamEventsUntil({
    //       eventStreamId,
    //       fromEventNumber: 0,
    //       maxCount: 3,
    //       resolveLinkTos: true,
    //       requireMaster: false
    //     }, 1).share();
    //     s.buffer(s.last())
    //       .map((events) => ({ message: { events, result: 0 } }))
    //       .subscribe(passWithData([ first, mid ], done), done.fail);
    //   });

    //   it("reads all events forward", function (done) {
    //     $.readAllEventsForward({
    //       maxCount: 3,
    //       commitPosition: 0,
    //       preparePosition: 0,
    //       requireMaster: false,
    //       resolveLinkTos: true
    //     }).subscribe(passWithCode(CODES.ReadAllEventsForwardCompleted, done), done.fail);
    //   });

    //   it("reads all events backward", function (done) {
    //     $.readAllEventsBackward({
    //       maxCount: 3,
    //       commitPosition: 0,
    //       preparePosition: 0,
    //       requireMaster: false,
    //       resolveLinkTos: true
    //     }).subscribe(passWithCode(CODES.ReadAllEventsBackwardCompleted, done), done.fail);
    //   });

    //   it("reads all events until a specified event position", function (done) {
    //     $.readAllEventsForward({ maxCount: 3, commitPosition: 0, preparePosition: 0, requireMaster: false, resolveLinkTos: true }).subscribe((response) => {
    //       const s = $.readAllEventsUntil({
    //         commitPosition: 0,
    //         maxCount: 3,
    //         preparePosition: 0,
    //         requireMaster: false,
    //         resolveLinkTos: true
    //       }, new ESPosition(response.message.nextCommitPosition, response.message.nextPreparePosition)).share();
    //       s.buffer(s.last())
    //         .map((events) => ({ message: { events, result: 0 } }))
    //         .subscribe((result) => {
    //           try {
    //             expect(result.message.events.length).toEqual(3);
    //             done();
    //           } catch (err) {
    //             done.fail(err);
    //           }
    //         });
    //     });
    //   });

    //   it("subscribes to stream", function (done) {
    //     const data = { newkey: "value" };
    //     const subscriptionId = v4();
    //     const con = connection({ host: "192.168.99.100", port: 1113, credentials: { username: "admin", password: "changeit" } });
    //     con.subscribeToStream({ eventStreamId, resolveLinkTos: true }, subscriptionId).subscribe(passWithData(data, done, subscriptionId, con), done.fail);
    //     con.writeEvents({
    //       eventStreamId,
    //       expectedVersion: ExpectedVersion.Any,
    //       requireMaster: false,
    //       events: [ event(data) ]
    //     });
    //   });

    //   it("subscribes to all", function (done) {
    //     const data = { newkeyforall: "value" };
    //     const subscriptionId = v4();
    //     const con = connection({ host: "192.168.99.100", port: 1113, credentials: { username: "admin", password: "changeit" } });
    //     con.subscribeToAll({ resolveLinkTos: true }, subscriptionId).subscribe(passWithData(data, done, subscriptionId, con), done.fail);
    //     con.writeEvents({
    //       eventStreamId,
    //       expectedVersion: ExpectedVersion.Any,
    //       requireMaster: false,
    //       events: [ event(data) ]
    //     });
    //   });

    it("subscribes to a stream starting with an earlier event", function (done) {
      jest.useRealTimers();
      const data = { newkeyforsubscription: "value" };
      const events: any = [];
      const subscriptionId = v4();
      const con = connection({ host: "192.168.99.100", port: 1113, credentials: { username: "admin", password: "changeit" } });
      con.subscribeToStreamFrom({
        eventStreamId,
        fromEventNumber: 0,
        maxCount: 100,
        resolveLinkTos: true,
        requireMaster: false
      }, subscriptionId).subscribe(function (e) {
        events.push(e);
        if (events.length === 4) {
          try {
            expect(events[ 0 ].event.eventNumber).toEqual(0);
            expect(JSON.parse(events[ 3 ].event.data.toString()).newkeyforsubscription).toEqual("value");
            con.unsubscribeFromStream(subscriptionId);
            done();
          } catch (err) {
            done.fail(err);
          }
        }
      }, done.fail);
      $.writeEvents({
        eventStreamId,
        expectedVersion: ExpectedVersion.Any,
        requireMaster: false,
        events: [ event(data) ]
      }).subscribe(console.log);
    });
  });
});
