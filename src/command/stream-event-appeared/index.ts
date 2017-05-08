import { Command as C } from "../command";
import { eventstore } from "esproto";

export const CODE = 0xC2;
export type CODE = typeof CODE;
export type Params = eventstore.proto.StreamEventAppeared$Properties;
export type Observer = (command: Command) => void;
export type OrderedObserver = Array<Observer>;
export type SubscriptionObserver = Observer | OrderedObserver;
export interface Command extends C<CODE, eventstore.proto.StreamEventAppeared> { }
export const Message = eventstore.proto.StreamEventAppeared;
