const fs = require('fs');
const eventstore = require('esproto');

/** ------------------------ GENERATE OUTGOING BUFFERS -------------------------------------- */
const OutgoingBufferWriters = [];

Object.entries(eventstore.OutgoingCodes).forEach(([ command, code ]) => {
  if (typeof code === 'string') return;
  if (eventstore[ command ]) {
    OutgoingBufferWriters.push(`${command}: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.${command}, eventstore.${command}$Properties>;`);
  } else {
    OutgoingBufferWriters.push(`${command}: OutgoingBufferWriter<eventstore.OutgoingCodes.${command}>;`);
  }
});

const finalOutgoingBufferWriters = `import * as eventstore from 'esproto';

import { OutgoingBufferWriter, OutgoingBufferWriterWithMessage } from '../core';

export interface OutgoingBufferWriters {
  ${OutgoingBufferWriters.join("\n  ")}
}
`;

fs.writeFileSync('./src/commands/outgoing-buffer-writers.ts', finalOutgoingBufferWriters, { flag: 'w' });

/** ------------------------ GENERATE INCOMING BUFFERS -------------------------------------- */
const IncomingBufferReaders = [];

Object.entries(eventstore.IncomingCodes).forEach(([ command, code ]) => {
  if (typeof code === 'string') return;
  if (eventstore[ command ]) {
    IncomingBufferReaders.push(`${command}: IncomingBufferReaderWithMessage<eventstore.IncomingCodes.${command}, eventstore.${command}$Properties>;`);
  } else {
    IncomingBufferReaders.push(`${command}: IncomingBufferReader<eventstore.IncomingCodes.${command}>;`);
  }
});

const finalIncomingBufferReaders = `import * as eventstore from 'esproto';

import { IncomingBufferReader, IncomingBufferReaderWithMessage } from '../core';

export interface IncomingBufferReaders {
  ${IncomingBufferReaders.join("\n  ")}
}
`;

fs.writeFileSync('./src/commands/incoming-buffer-readers.ts', finalIncomingBufferReaders, { flag: 'w' });

/** ------------------------ GENERATE COMMAND SUBJECT  -------------------------------------- */
const CommandSubjects = [];

Object.entries(eventstore.OutgoingCodes).forEach(([ command, code ]) => {
  if (typeof code === 'string') return;
  if (eventstore[ command ]) {
    CommandSubjects.push(`${command}: CommandSubjectWithDataFactory<eventstore.${command}$Properties>;`);
  } else {
    CommandSubjects.push(`${command}: CommandSubjectFactory;`);
  }
});

const finalCommandSubjects = `import * as eventstore from 'esproto';

import { CommandSubjectFactory, CommandSubjectWithDataFactory } from '../core';

export interface CommandSubjects {
  ${CommandSubjects.join("\n  ")}
}
`;

fs.writeFileSync('./src/streams/command-subjects.ts', finalCommandSubjects, { flag: 'w' });

/** ------------------------ GENERATE COMMAND OBSERVABLES  -------------------------------------- */
const CommandObservables = [];

Object.entries(eventstore.IncomingCodes).forEach(([ command, code ]) => {
  if (typeof code === 'string') return;
  if (eventstore[ command ]) {
    CommandObservables.push(`${command}: CommandObservableWithDataFactory<eventstore.IncomingCodes.${command}, eventstore.${command}$Properties>;`);
  } else {
    CommandObservables.push(`${command}: CommandObservableFactory<eventstore.IncomingCodes.${command}>;`);
  }
});

const finalCommandObservables = `import * as eventstore from 'esproto';

import { CommandObservableFactory, CommandObservableWithDataFactory } from '../core';

export interface CommandObservables {
  ${CommandObservables.join("\n  ")}
}
`;

fs.writeFileSync('./src/streams/command-observables.ts', finalCommandObservables, { flag: 'w' });

/** ------------------------ GENERATE STREAM PROVIDER  -------------------------------------- */
const Streams = [];

Object.entries(eventstore.OutgoingCodes).forEach(([ command, code ]) => {
  if (typeof code === 'string') return;
  if (eventstore[ command ]) {
    Streams.push(`public ${command[ 0 ].toLowerCase()}${command.slice(1)}: CommandSubjectWithData<eventstore.${command}$Properties>;`);
  } else {
    Streams.push(`public ${command[ 0 ].toLowerCase()}${command.slice(1)}: CommandSubject;`);
  }
});

Object.entries(eventstore.IncomingCodes).forEach(([ command, code ]) => {
  if (typeof code === 'string') return;
  if (eventstore[ command ]) {
    Streams.push(`public ${command[ 0 ].toLowerCase()}${command.slice(1)}$: CommandObservableWithData<eventstore.IncomingCodes.${command}, eventstore.${command}$Properties>;`);
  } else {
    Streams.push(`public ${command[ 0 ].toLowerCase()}${command.slice(1)}$: CommandObservable<eventstore.IncomingCodes.${command}>;`);
  }
});

const finalStreams = `import * as eventstore from 'esproto';

import { CommandSubject, CommandSubjectWithData, CommandObservable, CommandObservableWithData } from '../core';

export class StreamProvider {
  ${Streams.join("\n  ")}
}
`;

fs.writeFileSync('./src/streams/stream-provider.ts', finalStreams, { flag: 'w' });
