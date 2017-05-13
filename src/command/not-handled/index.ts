import { Command as C } from "../command";
import { eventstore } from "esproto";
export const CODE = 0xF1;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.NotHandled> { }
export type Params = eventstore.proto.NotHandled$Properties;
export const Message = eventstore.proto.NotHandled;
