import * as BadRequest from "./bad-request";
import * as Heartbeat from "./heartbeat";
import * as ReadAllEventsBackward from "./read-all-events-backward";
import * as ReadAllEventsBackwardCompleted from "./read-all-events-backward-completed";
import * as ReadAllEventsForward from "./read-all-events-forward";
import * as ReadAllEventsForwardCompleted from "./read-all-events-forward-completed";
import * as ReadStreamEventsBackward from "./read-stream-events-backward";
import * as ReadStreamEventsBackwardCompleted from "./read-stream-events-backward-completed";
import * as ReadStreamEventsForward from "./read-stream-events-forward";
import * as ReadStreamEventsForwardCompleted from "./read-stream-events-forward-completed";
import * as StreamEventAppeared from "./stream-event-appeared";
import * as SubscribeToStream from "./subscribe-to-stream";
import * as SubscriptionConfirmation from "./subscription-confirmation";
import * as SubscriptionDropped from "./subscription-dropped";
import * as TransactionCommit from "./transaction-commit";
import * as TransactionCommitCompleted from "./transaction-commit-completed";
import * as TransactionStart from "./transaction-start";
import * as TransactionStartCompleted from "./transaction-start-completed";
import * as TransactionWrite from "./transaction-write";
import * as TransactionWriteCompleted from "./transaction-write-completed";
import * as UnsubscribeFromStream from "./unsubscribe-from-stream";
import * as WriteEvents from "./write-events";
import * as WriteEventsCompleted from "./write-events-completed";

import { Command } from "./command";
import { v4 } from "uuid";

export {
  Command,
  Heartbeat,
  ReadAllEventsBackward,
  ReadAllEventsBackwardCompleted,
  ReadAllEventsForward,
  ReadAllEventsForwardCompleted,
  ReadStreamEventsBackward,
  ReadStreamEventsBackwardCompleted,
  ReadStreamEventsForward,
  ReadStreamEventsForwardCompleted,
  SubscribeToStream,
  StreamEventAppeared,
  SubscriptionConfirmation,
  SubscriptionDropped,
  TransactionCommit,
  TransactionCommitCompleted,
  TransactionStart,
  TransactionStartCompleted,
  TransactionWrite,
  TransactionWriteCompleted,
  UnsubscribeFromStream,
  WriteEvents,
  WriteEventsCompleted
};

export interface CommandNamespace {
  CODE: number;
  Message?: any;
  convertParams?: (params: any) => any;
}

export const CodeToNamespace = {
  [ BadRequest.CODE ]: BadRequest,
  [ ReadAllEventsForward.CODE ]: ReadAllEventsForward,
  [ ReadAllEventsForwardCompleted.CODE ]: ReadAllEventsForwardCompleted,
  [ ReadAllEventsBackward.CODE ]: ReadAllEventsBackward,
  [ ReadAllEventsBackwardCompleted.CODE ]: ReadAllEventsBackwardCompleted,
  [ ReadStreamEventsBackward.CODE ]: ReadStreamEventsBackward,
  [ ReadStreamEventsBackwardCompleted.CODE ]: ReadStreamEventsBackwardCompleted,
  [ ReadStreamEventsForward.CODE ]: ReadStreamEventsForward,
  [ ReadStreamEventsForwardCompleted.CODE ]: ReadStreamEventsForwardCompleted,
  [ StreamEventAppeared.CODE ]: StreamEventAppeared,
  [ SubscribeToStream.CODE ]: SubscribeToStream,
  [ SubscriptionConfirmation.CODE ]: SubscriptionConfirmation,
  [ SubscriptionDropped.CODE ]: SubscriptionDropped,
  [ TransactionCommit.CODE ]: TransactionCommit,
  [ TransactionCommitCompleted.CODE ]: TransactionCommitCompleted,
  [ TransactionStart.CODE ]: TransactionStart,
  [ TransactionStartCompleted.CODE ]: TransactionStartCompleted,
  [ TransactionWrite.CODE ]: TransactionWrite,
  [ TransactionWriteCompleted.CODE ]: TransactionWriteCompleted,
  [ UnsubscribeFromStream.CODE ]: UnsubscribeFromStream,
  [ WriteEvents.CODE ]: WriteEvents,
  [ WriteEventsCompleted.CODE ]: WriteEventsCompleted
};

const makeCommandFromParams = (Namespace: CommandNamespace, params?: any, correlationId?: string, encode: boolean = true) => {
  if (Namespace.convertParams) params = Namespace.convertParams(params);
  correlationId = correlationId || v4();
  let message;
  let encoded;
  if (encode && Namespace.Message) {
    message = Namespace.Message.create(params);
    encoded = Namespace.Message.encode(message).finish();
  }
  return {
    encoded,
    message,
    correlationId,
    id: Namespace.CODE,
    key: correlationId.replace(/-/g, "")
  };
};

const makeCommandFromMessage = (Namespace: CommandNamespace, message?: any, correlationId?: string) => {
  let params;
  if (Namespace.Message) params = Namespace.Message.decode(message);
  return makeCommandFromParams(Namespace, params, correlationId);
};

export function getCommand(id: WriteEvents.CODE, params: Buffer | WriteEvents.Params, correlationId?: string): WriteEvents.Command;
export function getCommand(id: WriteEventsCompleted.CODE, params: Buffer | WriteEventsCompleted.Params, correlationId?: string): WriteEventsCompleted.Command;
export function getCommand(id: ReadAllEventsBackward.CODE, params: Buffer | ReadAllEventsBackward.Params, correlationId?: string): ReadAllEventsBackward.Command;
export function getCommand(id: ReadAllEventsBackwardCompleted.CODE, params: Buffer | ReadAllEventsBackwardCompleted.Params, correlationId?: string): ReadAllEventsBackwardCompleted.Command;
export function getCommand(id: ReadAllEventsForward.CODE, params: Buffer | ReadAllEventsForward.Params, correlationId?: string): ReadAllEventsForward.Command;
export function getCommand(id: ReadAllEventsForwardCompleted.CODE, params: Buffer | ReadAllEventsForwardCompleted.Params, correlationId?: string): ReadAllEventsForwardCompleted.Command;
export function getCommand(id: ReadStreamEventsBackward.CODE, params: Buffer | ReadStreamEventsBackward.Params, correlationId?: string): ReadStreamEventsBackward.Command;
export function getCommand(id: ReadStreamEventsBackwardCompleted.CODE, params: Buffer | ReadStreamEventsBackwardCompleted.Params, correlationId?: string): ReadStreamEventsBackwardCompleted.Command;
export function getCommand(id: ReadStreamEventsForward.CODE, params: Buffer | ReadStreamEventsForward.Params, correlationId?: string): ReadStreamEventsForward.Command;
export function getCommand(id: ReadStreamEventsForwardCompleted.CODE, params: Buffer | ReadStreamEventsForwardCompleted.Params, correlationId?: string): ReadStreamEventsForwardCompleted.Command;
export function getCommand(id: StreamEventAppeared.CODE, params: Buffer | StreamEventAppeared.Params, correlationId?: string): StreamEventAppeared.Command;
export function getCommand(id: SubscribeToStream.CODE, params: Buffer | SubscribeToStream.Params, correlationId?: string): SubscribeToStream.Command;
export function getCommand(id: SubscriptionConfirmation.CODE, params: Buffer | SubscriptionConfirmation.Params, correlationId?: string): SubscriptionConfirmation.Command;
export function getCommand(id: SubscriptionDropped.CODE, params: Buffer | SubscriptionDropped.Params, correlationId?: string): SubscriptionDropped.Command;
export function getCommand(id: TransactionCommit.CODE, params: Buffer | TransactionCommit.Params, correlationId?: string): TransactionCommit.Command;
export function getCommand(id: TransactionCommitCompleted.CODE, params: Buffer | TransactionCommitCompleted.Params, correlationId?: string): TransactionCommitCompleted.Command;
export function getCommand(id: TransactionStart.CODE, params: Buffer | TransactionStart.Params, correlationId?: string): TransactionStart.Command;
export function getCommand(id: TransactionStartCompleted.CODE, params: Buffer | TransactionStartCompleted.Params, correlationId?: string): TransactionStartCompleted.Command;
export function getCommand(id: TransactionWrite.CODE, params: Buffer | TransactionWrite.Params, correlationId?: string): TransactionWrite.Command;
export function getCommand(id: TransactionWriteCompleted.CODE, params: Buffer | TransactionWriteCompleted.Params, correlationId?: string): TransactionWriteCompleted.Command;
export function getCommand(id: UnsubscribeFromStream.CODE, params: Buffer | UnsubscribeFromStream.Params, correlationId?: string): UnsubscribeFromStream.Command;
export function getCommand(id: BadRequest.CODE, params?: any, correlationId?: string): BadRequest.Command;
export function getCommand(id: number, params?: any, correlationId?: string) {
  const CommandNamespace = CodeToNamespace[ id ];
  if (CommandNamespace && params instanceof Buffer) return makeCommandFromMessage(CommandNamespace, params, correlationId);
  if (CommandNamespace) return makeCommandFromParams(CommandNamespace, params, correlationId);
  throw new Error(`Unknown command for id ${id}`);
}
