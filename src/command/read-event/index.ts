import { Command as C } from "../command";
import { eventstore } from "esproto";
export const CODE = 0xB0;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.ReadEvent> { }
export type Params = eventstore.proto.ReadEvent$Properties;
export const Message = eventstore.proto.ReadEvent;
