import { Command as C } from "../command";
import { eventstore } from "esproto";
export const CODE = 0xD1;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.ScavengeDatabaseCompleted> { }
export type Params = eventstore.proto.ScavengeDatabaseCompleted$Properties;
export const Message = eventstore.proto.ScavengeDatabaseCompleted;
