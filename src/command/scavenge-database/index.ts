import { Command as C } from "../command";
import { eventstore } from "esproto";
export const CODE = 0xD0;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.ScavengeDatabase> { }
export type Params = eventstore.proto.ScavengeDatabase$Properties;
export const Message = eventstore.proto.ScavengeDatabase;
