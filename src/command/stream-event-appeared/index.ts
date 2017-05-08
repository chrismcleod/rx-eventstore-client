import { Command as C } from "../command";
import { eventstore } from "esproto";

export const CODE = 0xC2;
export type CODE = typeof CODE;
export type Params = eventstore.proto.StreamEventAppeared$Properties;
export interface Observer {
  (command: Command): void;
}
export interface Command extends C<CODE, eventstore.proto.StreamEventAppeared> { }
export const Message = eventstore.proto.StreamEventAppeared;
