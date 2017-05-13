import { Command as C } from "../command";
import { eventstore } from "esproto";
export const CODE = 0x86;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.TransactionWrite> { }
export type Params = eventstore.proto.TransactionWrite$Properties;
export const Message = eventstore.proto.TransactionWrite;
