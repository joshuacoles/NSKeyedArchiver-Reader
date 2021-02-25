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

import fs from "fs";

import * as crypto from "crypto";
import assert from "assert";

export class Digester {
  archive: NSKeyedArchive
  private handlers: Handlers;
  private defaultHandler: Handler;

  constructor(archive: NSKeyedArchive, handlers: Handlers = defaultHandlers, defaultHandler: Handler = tap) {
    this.archive = archive;
    this.handlers = handlers;
    this.defaultHandler = defaultHandler;
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
    return (this.handlers[classOf] || this.defaultHandler).call(this, item);
  }

  run() {
    assert(this.archive.$top.root != null, "Archive has no root")
    return this.do(this.lookup(this.archive.$top.root!));
  }
}

function tap(this: Digester, t: ArchivedItem) {
  console.log(this.classOf(t), t);
  return t;
}

export type Handler = (this: Digester, t: ArchivedItem) => any;
export type Handlers = { [classname in RealisedClass]: Handler };

// We decide what to do with the item based on the class
export const defaultHandlers: Handlers = {
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
