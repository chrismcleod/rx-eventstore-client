import * as eventstore from 'esproto';

import { BLANK_CREDENTIALS, Credentials } from '../core';
import { parse, unparse } from 'uuid-parse';

import { IncomingBufferReaders } from './incoming-buffer-readers';
import { OutgoingBufferWriters } from './outgoing-buffer-writers';
import { v4 } from 'uuid';

export const FLAGS_NONE = 0;
export const FLAGS_AUTH = 1;
export const UINT32_LENGTH = 4;
export const GUID_LENGTH = 16;
export const HEADER_LENGTH = 1 + 1 + GUID_LENGTH;
export const COMMAND_OFFSET = UINT32_LENGTH;
export const FLAGS_OFFSET = COMMAND_OFFSET + 1;
export const CORRELATION_ID_OFFSET = FLAGS_OFFSET + 1;
export const DATA_OFFSET = CORRELATION_ID_OFFSET + GUID_LENGTH;

export const toBuffer = (code: number, credentials: Credentials = BLANK_CREDENTIALS, id: string = v4()) => {
  const { username, password } = credentials;

  const usernameLength = (username && username.length > 0) ? Buffer.byteLength(username) : 0;
  const passwordLength = (password && password.length > 0) ? Buffer.byteLength(password) : 0;
  const credentialsLength = usernameLength + passwordLength > 0 ? usernameLength + passwordLength + 2 : 0;

  const commandLength = HEADER_LENGTH + credentialsLength;

  const buffer = Buffer.alloc(commandLength + UINT32_LENGTH);
  buffer.writeUInt32LE(commandLength, 0);
  buffer[ COMMAND_OFFSET ] = code;
  buffer[ FLAGS_OFFSET ] = credentialsLength > 0 ? FLAGS_AUTH : FLAGS_NONE;
  parse(id, buffer, CORRELATION_ID_OFFSET);

  if (credentialsLength > 0) {
    buffer.writeUInt8(usernameLength, DATA_OFFSET);
    buffer.write(username, DATA_OFFSET + 1);
    buffer.writeUInt8(passwordLength, DATA_OFFSET + 1 + usernameLength);
    buffer.write(password, DATA_OFFSET + 1 + usernameLength + 1);
  }
  return buffer;
};

export const toBufferWithMessage = (messageFactory: eventstore.MessageFactory, code: number, data: any, credentials: Credentials = BLANK_CREDENTIALS, id: string = v4()) => {

  const buffer = toBuffer(code, credentials, id);
  const dataBuffer = messageFactory.encode(data).finish() as Buffer;
  const newBuffer = Buffer.alloc(buffer.byteLength + dataBuffer.byteLength);
  const commandLength = buffer.readUInt32LE(0) + dataBuffer.byteLength;
  buffer.copy(newBuffer, 0, 0);
  newBuffer.writeUInt32LE(commandLength, 0);
  dataBuffer.copy(newBuffer, buffer.byteLength, 0);

  return newBuffer;
};

export const toCommand = (code: number, buffer: Buffer) => ({ code, id: unparse(buffer, CORRELATION_ID_OFFSET) });
export const toCommandWithMessage = (messageFactory: eventstore.MessageFactory, code: number, buffer: Buffer) => {
  const message = messageFactory.decode(buffer.slice(DATA_OFFSET));
  const command = toCommand(code, buffer);
  return { ...command, message };
};

export const outgoingBuffers: OutgoingBufferWriters = Object.entries(eventstore.OutgoingCodes).reduce((out, [ command, code ]) => {
  if (typeof code === 'string') {
    return out;
  }
  const messageFactory = eventstore.getOutgoingMessage(command as any);
  if (messageFactory) {
    out[ command ] = (data: any, id: string = v4(), credentials: Credentials = BLANK_CREDENTIALS) => toBufferWithMessage(messageFactory, code, data, credentials, id);
  } else {
    out[ command ] = (id: string = v4(), credentials: Credentials = BLANK_CREDENTIALS) => toBuffer(code, credentials, id);
  }
  return out;
}, {} as any);

export const incomingBuffers: IncomingBufferReaders = Object.entries(eventstore.IncomingCodes).reduce((out, [ command, code ]) => {
  if (typeof code === 'string') {
    return out;
  }
  const messageFactory = eventstore.getIncomingMessage(command as any);
  if (messageFactory) {
    out[ command ] = (buffer: Buffer) => toCommandWithMessage(messageFactory, code, buffer);
  } else {
    out[ command ] = (buffer: Buffer) => toCommand(code, buffer);
  }
  return out;
}, {} as any);
