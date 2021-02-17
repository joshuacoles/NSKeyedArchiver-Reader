import { parseNSKR } from "./parse";
import { Digester } from "./digest";
import globby from "globby";
import fs from "fs";
import * as util from "util";
import path from "path";

(async () => {
  const pls = await globby(['./data/*.plist']);
  for (let pl of pls) {
    const [data] = await parseNSKR(pl);

    fs.writeFileSync(
      './jd/' + path.basename(pl) + '.json',
      JSON.stringify(new Digester(data).digestRoot()) || ""
    );
  }
})()
