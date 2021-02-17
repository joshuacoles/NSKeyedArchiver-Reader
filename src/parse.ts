// @ts-ignore
import bplist from "bplist-parser";
import { NSKeyedArchive } from "./types";

export async function parseNSKR(plist: string): Promise<NSKeyedArchive[]> {
  return bplist.parseFile(plist)
}
