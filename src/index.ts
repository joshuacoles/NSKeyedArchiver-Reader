import { parseBuffer } from "bplist-parser";
import { Digester } from "./digester";
import { NSKeyedArchive } from "./types";

export { Digester }

export function unpackRaw(buffer: Buffer): NSKeyedArchive {
  return parseBuffer(buffer)[0] as NSKeyedArchive;
}

export function unpackRoot(buffer: Buffer) {
  const archive = unpackRaw(buffer);
  const digester = new Digester(archive);

  return digester.run();
}
