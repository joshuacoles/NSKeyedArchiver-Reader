import { parseNSKR } from "./parse";
import globby from "globby";
import * as fs from "fs";

(async () => {
  const pls = await globby(['./highlights/*.plist']);
  const ds = await Promise.all(pls.map(pl => parseNSKR(pl)));
  fs.writeFileSync('./highlights.json', JSON.stringify(ds));
})()
