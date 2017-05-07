import { Command as C } from "../command";
import { eventstore } from "esproto";
export const CODE = 0xB5;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.ReadStreamEventsCompleted> { }
export type Params = eventstore.proto.ReadStreamEventsCompleted$Properties;
export const Message = eventstore.proto.ReadStreamEventsCompleted;
