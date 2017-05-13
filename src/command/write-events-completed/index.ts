import { Command as C } from "../command";
import { eventstore } from "esproto";
export const CODE = 0x83;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.WriteEventsCompleted> { }
export type Params = eventstore.proto.WriteEventsCompleted$Properties;
export const Message = eventstore.proto.WriteEventsCompleted;
