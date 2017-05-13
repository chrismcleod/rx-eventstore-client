import { Command as C } from "../command";
import { eventstore } from "esproto";
export const CODE = 0x88;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.TransactionCommit> { }
export type Params = eventstore.proto.TransactionCommit$Properties;
export const Message = eventstore.proto.TransactionCommit;
