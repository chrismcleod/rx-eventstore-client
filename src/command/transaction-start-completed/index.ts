import { Command as C } from "../command";
import { eventstore } from "esproto";
export const CODE = 0x85;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.TransactionStartCompleted> { }
export type Params = eventstore.proto.TransactionStartCompleted$Properties;
export const Message = eventstore.proto.TransactionStartCompleted;
