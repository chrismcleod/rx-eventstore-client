import { COMMAND_OFFSET, CORRELATION_ID_OFFSET, DATA_OFFSET, FLAGS_OFFSET, GUID_LENGTH, HEADER_LENGTH, UINT32_LENGTH } from "../constants";
import { parse, unparse } from "uuid-parse";

import EventStore from "../eventstore";
import { Message } from "protobufjs";
import { getMessage } from "./codes";
import { v4 } from "uuid";

export interface MessageEnum<T> {
  [ key: string ]: T;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface TCPPackage {
  code: number;
  credentials?: Credentials;
  id: Buffer;
  message?: Buffer;
}

export interface Command<T> {
  code: number;
  id: string;
  message?: T;
  encoded?: Buffer;
}

const encode = (params: TCPPackage) => {
  const usernameLength = params.credentials ? Buffer.byteLength(params.credentials.username) : 0;
  const passwordLength = params.credentials ? Buffer.byteLength(params.credentials.password) : 0;
  const credentialsLength = params.credentials ? usernameLength + passwordLength + 2 : 0;
  const messageLength = params.message ? params.message.byteLength : 0;
  const commandLength = HEADER_LENGTH + credentialsLength + messageLength;
  const buffer = Buffer.alloc(commandLength + UINT32_LENGTH);
  buffer.writeUInt32LE(commandLength, 0);
  buffer[ COMMAND_OFFSET ] = params.code;
  buffer[ FLAGS_OFFSET ] = credentialsLength > 0 ? 1 : 0;

  params.id.copy(
    buffer, CORRELATION_ID_OFFSET,
    0, GUID_LENGTH
  );

  if (params.credentials) {
    buffer.writeUInt8(usernameLength, DATA_OFFSET);
    buffer.write(params.credentials.username, DATA_OFFSET + 1);
    buffer.writeUInt8(passwordLength, DATA_OFFSET + 1 + usernameLength);
    buffer.write(params.credentials.password, DATA_OFFSET + 1 + usernameLength + 1);
  }

  if (params.message) {
    params.message.copy(
      buffer, DATA_OFFSET + credentialsLength,
      0, messageLength
    );
  }

  return buffer;
}

export const wtfGuid = (uuid: string) => {
  const hex = uuid.replace(/-/g, '');
  const guid =
    hex.substring(6, 8) +
    hex.substring(4, 6) +
    hex.substring(2, 4) +
    hex.substring(0, 2) +
    "-" +
    hex.substring(10, 12) +
    hex.substring(8, 10) +
    "-" +
    hex.substring(14, 16) +
    hex.substring(12, 14) +
    "-" +
    hex.substring(16, 20) +
    "-" +
    hex.substring(20);
  return guid;
}

export const commandFromBuffer = (code: number, buffer: Buffer) => {
  const id = unparse(buffer, CORRELATION_ID_OFFSET);
  const data = buffer.slice(DATA_OFFSET);
  const Message = getMessage(code);
  const message = Message ? Message.decode(data) : undefined;
  return { code, message, id, encoded: buffer };
};

export const commandToBuffer = <T>(command: Command<T>, credentials?: Credentials): Buffer | void => {
  if (command.message) {
    const { id, code, message } = command;
    const idBuffer = Buffer.alloc(16);
    id ? parse(id, idBuffer, 0) : v4(null, idBuffer, 0);
    const Message = getMessage(code);
    const messageBuffer = Message.encode(message).finish();
    return encode({ code, id: idBuffer, message: messageBuffer, credentials });
  }
  return;
}
