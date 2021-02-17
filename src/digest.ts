import {
  isKeyedObject,
  isUnkeyedObject,
  NSClass,
  NSKeyedArchive,
  NSObject,
  NSObjectKeyed,
  ObjectType,
  Reference
} from "./types";

import { fromPairs, zip } from "ramda";

export interface DigestedObject {
  [key: string]: any
}

export class Digester {
  archive: NSKeyedArchive

  constructor(archive: NSKeyedArchive) {
    this.archive = archive;
  }

  lookup<T extends ObjectType>(reference: Reference): T {
    if (reference === undefined) debugger;

    return this.archive.$objects[reference.UID] as T;
  }

  digestRoot() {
    if (this.archive.$top.root === undefined) {
      console.log("AHHH NO ROOT");
      return;
    }

    return this.digestObject(this.lookup<NSObject>(this.archive.$top.root!));
  }

  digest(object: ObjectType) {
    if (typeof object !== 'object') return object;
    if (object.hasOwnProperty('$class')) return this.digestObject(object as NSObject);
    if (object.hasOwnProperty('$classname')) return object;

    console.log("found other...")
    console.log(object)
    return object;
  }

  // Looks like what we have called Keyed / Unkeyed are actually dictionaries and lists, fun
  digestObject(nsObject: NSObject): DigestedObject {
    if (isKeyedObject(nsObject)) {
      return {
        ...fromPairs(
          zip(nsObject["NS.keys"], nsObject["NS.objects"])
            .map(([k, v]) => [this.lookup<string>(k), this.digest(this.lookup(v))])
        ),

        $class: this.lookup<NSClass>(nsObject.$class).$classname
      };
    } else if (isUnkeyedObject(nsObject)){
      return nsObject["NS.objects"].map(ref => this.digest(this.lookup(ref)));
    } else {
      return {
        $class: this.lookup<NSClass>(nsObject.$class).$classname,
        object: nsObject
      };
    }
  }
}
