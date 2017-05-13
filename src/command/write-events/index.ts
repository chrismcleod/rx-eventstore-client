import { Command as C } from "../command";
import { eventstore } from "esproto";
export const CODE = 0x82;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.WriteEvents> { }
export type Params = eventstore.proto.WriteEvents$Properties;
export const Message = eventstore.proto.WriteEvents;
