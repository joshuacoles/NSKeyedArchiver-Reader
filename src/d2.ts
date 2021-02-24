import { fromPairs, zip } from "ramda";
import {
  ArchivedItem,
  ClassName,
  NSArray,
  NSClassInfo,
  NSDictionary,
  NSKeyedArchive,
  NSSpecialValueTypes,
  NSString,
  NSValue,
  ObjectType,
  RealisedClass,
  Reference
} from "./types";
import { parseNSKR } from "./parse";
import globby from "globby";
import fs from "fs";
import path from "path";

import * as crypto from "crypto";

class D2 {
  archive: NSKeyedArchive

  constructor(archive: NSKeyedArchive) {
    this.archive = archive;
  }

  lookup<T extends ObjectType>(reference: Reference): T {
    if (reference === undefined) debugger;

    return this.archive.$objects[reference.UID] as T;
  }

  classOf(item: ArchivedItem): RealisedClass {
    if (item.$class === undefined) debugger;
    return this.lookup<NSClassInfo>(item.$class).$classname! as RealisedClass;
  }

  do(item: ArchivedItem) {
    if (typeof item !== "object") return item;

    // Deal with buffers
    if (Buffer.isBuffer(item)) {
      const hash = crypto.createHash('sha512')
        .update(item)
        .digest('hex');

      fs.writeFileSync(`./highlights-data/${hash}`, item);

      return { type: "BUFFER_REFERENCE", ref: hash }
    }

    let classOf = this.classOf(item);
    return (handlers[classOf] || tap).call(this, item);
  }
}

(async () => {
  const pls = await globby(['./highlights/*.plist']);
  for (let pl of pls) {
    const [data] = await parseNSKR(pl);

    let d2 = new D2(data);
    if (data.$top.root === undefined) continue;

    fs.writeFileSync(
      './highlights-json/' + path.basename(pl) + '.json',
      JSON.stringify(d2.do(d2.lookup(data.$top.root))) || ""
    );
  }
})()

function tap(this: D2, t: ArchivedItem) {
  console.log(this.classOf(t), t);
  return t;
}

// We decide what to do with the item based on the class
const handlers: { [classname in RealisedClass]: (this: D2, t: ArchivedItem) => any } = {
  [ClassName.NSMutableArray](v: any) {
    const ar = v as NSArray;
    return ar['NS.objects'].map(ref => this.do(this.lookup(ref)))
  },

  [ClassName.NSDictionary](v: any) {
    const ar = v as NSDictionary;
    return fromPairs(zip(ar["NS.keys"], ar['NS.objects'])
      .map(([k, v]) => [this.lookup<string>(k), this.do(this.lookup(v))]));
  },

  [ClassName.NSMutableDictionary](v: any) {
    if (!(v.hasOwnProperty('NS.keys') && v.hasOwnProperty('NS.objects'))) debugger;
    const ar = v as NSDictionary;
    return fromPairs(zip(ar["NS.keys"], ar['NS.objects'])
      .map(([k, v]) => [this.lookup<string>(k), this.do(this.lookup(v))]));
  },

  [ClassName.NSMutableString](v: ArchivedItem) {
    return (v as NSString)["NS.string"];
  },

  [ClassName.NSArray](v: any) {
    const ar = v as NSArray;
    return ar['NS.objects'].map(ref => this.do(this.lookup(ref)))
  },

  [ClassName.NSValue](v: ArchivedItem) {
    const ar = v as NSValue;
    if (ar["NS.special"] === NSSpecialValueTypes.NSSize) {
      return {
        size: this.do(this.lookup(ar["NS.sizeval"]))
      };
    } else if (ar["NS.special"] === NSSpecialValueTypes.NSRect) {
      return {
        rect: this.do(this.lookup(ar["NS.rectval"]))
      };
    } else {
      console.log("Unknown NSV", v);
    }
    return v;
  },
};
