import { Command as C } from "../command";
import { eventstore } from "esproto";

export const CODE = 0xC0;
export type CODE = typeof CODE;
export type Params = eventstore.proto.SubscribeToStream$Properties;
export interface Command extends C<CODE, eventstore.proto.SubscribeToStream> { }
export const Message = eventstore.proto.SubscribeToStream;
