import { Command as C } from "../command";
import { eventstore } from "esproto";

export const CODE = 0xC3;
export type CODE = typeof CODE;
export type Params = eventstore.proto.UnsubscribeFromStream$Properties;
export interface Command extends C<CODE, eventstore.proto.UnsubscribeFromStream> { }
export const Message = eventstore.proto.UnsubscribeFromStream;
