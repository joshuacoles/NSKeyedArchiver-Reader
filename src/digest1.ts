import R from "ramda";
import { Class } from "./types";
import { parseNSKR } from "./parse";

const { identity } = R;

function p(obj: any, f: Function) {
  if (typeof obj !== "object") {
    f(obj)
    return;
  }

  for (let [k, v] of Object.entries(obj)) {
    f(v, k)
    p(v, f)
  }
}

function pp(obj: any, f: Function) {
  if (typeof obj !== "object") {
    f(obj)
    return;
  }

  for (let [k, v] of Object.entries(obj)) {
    p(f(v, k), f)
  }
}

(async () => {
  const v = (await parseNSKR('/Users/joshuacoles/checkouts/joshuacoles/nskr-plist/data/znotes_15.plist'))[0];
  p(v, (v: any) => {
    console.log(v);
    return v;
  })
})()

// We decide what to do with the item based on the class
const handlers: { [classname in Class]: Function } = {
  [Class.Empty]: identity,
  [Class.NSArray]: identity,
  [Class.NSDictionary]: identity,
  [Class.NSMutableArray]: identity,
  [Class.NSMutableDictionary]: identity,
  [Class.NSMutableString]: identity,
  [Class.NSObject]: identity,
  [Class.NSString]: identity,
  [Class.NSValue]: identity,
};
