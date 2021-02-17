import R from "ramda";

export type ObjectType = boolean | number | string | NSObject | NSClass | Other;

export interface NSKeyedArchive {
  $version:  100000;
  $archiver: 'NSKeyedArchiver';
  $top:      Top;
  $objects:  ObjectType[];
}

export interface NSObjectKeyed {
  $class:       Reference;

  "NS.keys":    Reference[];
  "NS.objects": Reference[];
}

export interface NSObjectUnkeyed {
  $class:       Reference;

  "NS.objects": Reference[];
}

export function isKeyedObject(nsObject: NSObject): nsObject is NSObjectKeyed {
  return R.has('NS.keys', nsObject);
}

export function isUnkeyedObject(nsObject: NSObject): nsObject is NSObjectUnkeyed {
  return !isKeyedObject(nsObject) && R.has('NS.objects', nsObject);
}

export type NSObject = NSObjectKeyed | NSObjectUnkeyed | Other;

export interface NSClass {
  $classname?:   Class;
  $classes?:     Class[];
}

export interface Other {
  $class:       Reference;

  "NS.rectval"?: Reference;
  "NS.special"?: number;
  "NS.sizeval"?: Reference;
  "NS.string"?:  string;
}

export interface Reference {
  UID: number;
}

export enum Class {
  Empty = "",
  NSArray = "NSArray",
  NSDictionary = "NSDictionary",
  NSMutableArray = "NSMutableArray",
  NSMutableDictionary = "NSMutableDictionary",
  NSMutableString = "NSMutableString",
  NSObject = "NSObject",
  NSString = "NSString",
  NSValue = "NSValue",
}

export interface Top {
  root?: Reference;
}
