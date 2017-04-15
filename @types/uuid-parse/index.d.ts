declare module "uuid-parse" {
  export const parse: (uuid: string) => Array<number>;
  export const unparse: (buffer: Buffer, offset?: number) => string;
}
