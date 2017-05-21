declare module "uuid-parse" {
  export const parse: (uuid: string, buffer?: Buffer, offset?: number) => Array<number>;
  export const unparse: (buffer: Buffer, offset?: number) => string;
}
