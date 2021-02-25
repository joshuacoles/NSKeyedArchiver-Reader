declare module "bplist-parser" {
  interface ParsedObject {}

  export function parseFile(fileNameOrBuffer: string | Buffer, callback?: (obj: ParsedObject) => void): Promise<[ParsedObject]>
  export function parseBuffer(buffer: Buffer): [ParsedObject]
}
