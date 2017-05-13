import { Command as C } from "../command";
import { eventstore } from "esproto";
export const CODE = 0x8A;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.DeleteStream> { }
export type Params = eventstore.proto.DeleteStream$Properties;
export const Message = eventstore.proto.DeleteStream;
