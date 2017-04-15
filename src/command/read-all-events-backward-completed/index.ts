import { Command as C } from "../command";
import { eventstore } from "esproto";
export const CODE = 0xB9;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.ReadAllEventsCompleted> { }
export type Params = eventstore.proto.ReadAllEventsCompleted$Properties;
export const Message = eventstore.proto.ReadAllEventsCompleted;
