import { Command as C } from "../command";
import { Position } from "../command";
import { baseConvertParams } from "../read-all-events";
import { eventstore } from "esproto";

export { Params } from "../read-all-events";
export const CODE = 0xB6;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.ReadAllEvents> { }
export const convertParams = baseConvertParams(Position.First);
export const Message = eventstore.proto.ReadAllEvents;
