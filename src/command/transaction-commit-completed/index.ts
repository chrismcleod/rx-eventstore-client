import { Command as C } from "../command";
import { eventstore } from "esproto";
export const CODE = 0x89;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.TransactionCommitCompleted> { }
export type Params = eventstore.proto.TransactionCommitCompleted$Properties;
export const Message = eventstore.proto.TransactionCommitCompleted;
