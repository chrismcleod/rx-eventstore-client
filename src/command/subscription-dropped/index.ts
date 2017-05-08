import { Command as C } from "../command";
import { eventstore } from "esproto";

export const CODE = 0xC4;
export type CODE = typeof CODE;
export type Params = eventstore.proto.SubscriptionDropped$Properties;
export interface Command extends C<CODE, eventstore.proto.SubscriptionDropped> { }
export const Message = eventstore.proto.SubscriptionDropped;
