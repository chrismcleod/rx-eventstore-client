import { Command as C } from "../command";
import { eventstore } from "esproto";

export const CODE = 0xC1;
export type CODE = typeof CODE;
export type Params = eventstore.proto.SubscriptionConfirmation$Properties;
export interface Command extends C<CODE, eventstore.proto.SubscriptionConfirmation> { }
export const Message = eventstore.proto.SubscriptionConfirmation;
