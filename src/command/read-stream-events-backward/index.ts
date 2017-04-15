import { Command as C } from "../command";
import { eventstore } from "../../../../esproto/index";
export const CODE = 0xB4;
export type CODE = typeof CODE;
export interface Command extends C<CODE, eventstore.proto.ReadStreamEvents> { }
export type Params = eventstore.proto.ReadStreamEvents$Properties;
export const Message = eventstore.proto.ReadStreamEvents;
