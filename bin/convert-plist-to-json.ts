import globby from "globby";
import { readFile, writeFile } from "fs/promises";
import { unpackRoot } from "../index";

(async () => {
  const plists = await globby(['./highlights/*.plist']);
  const unpacked = plists
    .map(plist => readFile(plist))
    .map(async buffer => unpackRoot(await buffer));

  await writeFile('./highlights.json', JSON.stringify(Promise.all(unpacked)));
})()
