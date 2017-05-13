import { Command as C } from "../command";
export const CODE = 0xF3;
export type CODE = typeof CODE;
export interface Command extends C<CODE, {}> { }
export const Message = {
  create: (params: string) => {
    return params;
  },
  decode: (buffer: Buffer) => {
    return buffer.toString("utf8");
  },
  encode: (params: string) => {
    return { finish: () => Buffer.from(params) };
  }
};
