import { Command as C } from "../command";
import { eventstore } from "esproto";
export const CODE = 0xB1;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.ReadEventCompleted> { }
export type Params = eventstore.proto.ReadEventCompleted$Properties;
export const Message = eventstore.proto.ReadEventCompleted;
