import { Command as C } from "../command";
import { eventstore } from "esproto";
export const CODE = 0x84;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.TransactionStart> { }
export type Params = eventstore.proto.TransactionStart$Properties;
export const Message = eventstore.proto.TransactionStart;
