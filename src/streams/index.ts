import './rx-operators';

import * as eventstore from 'esproto';

import { BLANK_CREDENTIALS, Credentials, IncomingBufferReader, IncomingBufferReaderWithMessage, OutgoingBufferWriter, OutgoingBufferWriterWithMessage } from '../core';
import { Observable, Subject } from 'rxjs';
import { UINT32_LENGTH, incomingBuffers, outgoingBuffers } from '../commands';

import { CommandObservables } from './command-observables';
import { CommandSubjects } from './command-subjects';

export * from './data';
export * from './write';
export * from './command-observables';
export * from './command-subjects';
export * from './stream-provider';

export const subjects: CommandSubjects = Object.entries(eventstore.OutgoingCodes).reduce((out, [ command, code ]) => {
  if (typeof code === 'string') {
    return out;
  }
  if ((eventstore as any)[ command ]) {
    const bufferWriter: OutgoingBufferWriterWithMessage<any, any> = (outgoingBuffers as any)[ command ];
    out[ command ] =
      (write$: Subject<Buffer>, defaultCredentials: Credentials = BLANK_CREDENTIALS) =>
        (data: any, id?: string, credentials?: Credentials) =>
          write$.next(bufferWriter(data, id, credentials || defaultCredentials));
  } else {
    const bufferWriter: OutgoingBufferWriter<any> = (outgoingBuffers as any)[ command ];
    out[ command ] =
      (write$: Subject<Buffer>, defaultCredentials: Credentials = BLANK_CREDENTIALS) =>
        (id?: string, credentials?: Credentials) =>
          write$.next(bufferWriter(id, credentials || defaultCredentials));
  }
  return out;
}, {} as any);

export const observables: CommandObservables = Object.entries(eventstore.IncomingCodes).reduce((out, [ command, code ]) => {
  if (typeof code === 'string') {
    return out;
  }
  if ((eventstore as any)[ command ]) {
    const bufferReader: IncomingBufferReaderWithMessage<any, any> = (incomingBuffers as any)[ command ];
    out[ command ] =
      (data$: Observable<Buffer>) =>
        data$.filter((buffer) => buffer.readUInt8(UINT32_LENGTH) === code).map((buffer) => bufferReader(buffer));
  } else {
    const bufferReader: IncomingBufferReader<any> = (incomingBuffers as any)[ command ];
    out[ command ] =
      (data$: Observable<Buffer>) =>
        data$.filter((buffer) => buffer.readUInt8(UINT32_LENGTH) === code).map((buffer) => bufferReader(buffer));
  }
  return out;
}, {} as any);
