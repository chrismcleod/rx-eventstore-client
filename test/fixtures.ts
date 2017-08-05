import * as eventstore from 'esproto';

import { parse } from 'uuid-parse';

export const ReadEventCompleted$Properties: eventstore.ReadEventCompleted$Properties = {
  result: 0,
  event: {
    event: {
      created: 1501431047,
      createdEpoch: 1501431047,
      data: Buffer.from(JSON.stringify({ key: 'value' })),
      dataContentType: 1,
      eventId: parse('ef23214c-e5ff-43ad-be2b-775fb4441c91'),
      eventNumber: 0,
      eventStreamId: '9d40391c-a01c-470e-acdd-072a97b1b30a',
      eventType: 'Test',
      metadata: Buffer.from(JSON.stringify({ meta: 'value' })),
      metadataContentType: 1
    },
    link: {
      created: 1501431047,
      createdEpoch: 1501431047,
      data: Buffer.from(JSON.stringify({ key: 'value' })),
      dataContentType: 1,
      eventId: parse('ef23214c-e5ff-43ad-be2b-775fb4441c91'),
      eventNumber: 0,
      eventStreamId: '9d40391c-a01c-470e-acdd-072a97b1b30a',
      eventType: 'Test',
      metadata: Buffer.from(JSON.stringify({ meta: 'value' })),
      metadataContentType: 1
    }
  }
};
