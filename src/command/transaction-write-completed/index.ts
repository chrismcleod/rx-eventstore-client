import { Command as C } from "../command";
import { eventstore } from "esproto";
export const CODE = 0x87;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.TransactionWriteCompleted> { }
export type Params = eventstore.proto.TransactionWriteCompleted$Properties;
export const Message = eventstore.proto.TransactionWriteCompleted;
