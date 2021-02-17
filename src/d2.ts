import R, { fromPairs, zip } from "ramda";
import { Class, NSClass, NSKeyedArchive, NSSpecialValueTypes, ObjectType, RealisedClasses, Reference } from "./types";
import { parseNSKR } from "./parse";
import globby from "globby";
import fs from "fs";
import path from "path";

type T = { $class: Reference };

class D2 {
  archive: NSKeyedArchive

  constructor(archive: NSKeyedArchive) {
    this.archive = archive;
  }

  lookup<T extends ObjectType>(reference: Reference): T {
    if (reference === undefined) debugger;

    return this.archive.$objects[reference.UID] as T;
  }

  classOf(thing: T): RealisedClasses {
    return this.lookup<NSClass>(thing.$class).$classname! as RealisedClasses;
  }

  do(thing: T) {
    if (typeof thing !== "object") return thing;

    let classOf = this.classOf(thing);

    let v = handlers[classOf].call(this, thing);
    // console.log(classOf, v);
    return v;
  }
}

(async () => {
  const pls = await globby(['./data/*.plist']);
  for (let pl of pls) {
    const [data] = await parseNSKR(pl);

    let d2 = new D2(data);
    if (data.$top.root === undefined) continue;

    fs.writeFileSync(
      './jdd/' + path.basename(pl) + '.json',
      JSON.stringify(d2.do(d2.lookup(data.$top.root))) || ""
    );
  }
})()

interface NSMutableArray {
  $class: Reference,
  'NS.objects': Reference[]
}

interface NSDictionary {
  $class: Reference,
  'NS.keys': Reference[]
  'NS.objects': Reference[]
}

interface NSString {
  $class: Reference,
  'NS.string': string
}

type NSValue = T & ({
  'NS.special': NSSpecialValueTypes.NSRect
  'NS.rectval': Reference
} | {
  'NS.special': NSSpecialValueTypes.NSSize
  'NS.sizeval': Reference
})

function tap(this: D2, t: T) {
  console.log(this.classOf(t), t);
  return t;
}

// We decide what to do with the item based on the class
const handlers: { [classname in RealisedClasses]: (this: D2, t: T) => any } = {
  [Class.NSMutableArray](v: any) {
    const ar = v as NSMutableArray;
    return ar['NS.objects'].map(ref => this.do(this.lookup(ref)))
  },

  [Class.NSDictionary](v: any) {
    const ar = v as NSDictionary;
    return fromPairs(zip(ar["NS.keys"], ar['NS.objects'])
      .map(([k, v]) => [this.lookup<string>(k), this.do(this.lookup(v))]));
  },

  [Class.NSMutableDictionary](v: any) {
    const ar = v as NSDictionary;
    return fromPairs(zip(ar["NS.keys"], ar['NS.objects'])
      .map(([k, v]) => [this.lookup<string>(k), this.do(this.lookup(v))]));
  },

  [Class.NSMutableString](v: T) {
    return (v as NSString)["NS.string"];
  },

  [Class.NSArray](v: any) {
    const ar = v as NSMutableArray;
    return ar['NS.objects'].map(ref => this.do(this.lookup(ref)))
  },

  [Class.NSValue](v: T) {
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
