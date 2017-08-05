declare module "uuid-parse" {
  export const parse: (uuid: string, buffer?: Buffer & Uint8Array, offset?: number) => Buffer;
  export const unparse: (buffer: Buffer | Uint8Array, offset?: number) => string;
}
