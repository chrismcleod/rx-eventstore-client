import { Command as C } from "../command";
import { eventstore } from "esproto";
export const CODE = 0x8B;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.DeleteStreamCompleted> { }
export type Params = eventstore.proto.DeleteStreamCompleted$Properties;
export const Message = eventstore.proto.DeleteStreamCompleted;
