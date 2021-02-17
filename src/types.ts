import R from "ramda";

export type ObjectType = boolean | number | string | NSObject | NSClass | Other;

export interface NSKeyedArchive {
  $version: 100000;
  $archiver: 'NSKeyedArchiver';
  $top: Top;
  $objects: ObjectType[];
}

export interface NSDictionary {
  $class: Reference;

  "NS.keys": Reference[];
  "NS.objects": Reference[];
}

export interface NSArray {
  $class: Reference;

  "NS.objects": Reference[];
}

export function isNSDictionary(nsObject: NSObject): nsObject is NSDictionary {
  return R.has('NS.keys', nsObject);
}

export function isNSArray(nsObject: NSObject): nsObject is NSArray {
  return !isNSDictionary(nsObject) && R.has('NS.objects', nsObject);
}

export type NSObject = NSDictionary | NSArray | Other;

export interface NSClass {
  $classname: Class;
  $classes: Class[];
}

export interface Other {
  $class: Reference;

  "NS.rectval"?: Reference;
  "NS.special"?: number;
  "NS.sizeval"?: Reference;
  "NS.string"?: string;
}

export interface Reference {
  UID: number;
}

export type RealisedClasses =
  | Class.NSArray
  | Class.NSDictionary
  | Class.NSMutableArray
  | Class.NSMutableDictionary
  | Class.NSMutableString
  | Class.NSValue;


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

export enum NSSpecialValueTypes {
  NSPoint = 1,
  NSSize = 2,
  NSRect = 3,
  NSRange = 4,
  NSEdgeInsets = 12,
}

export interface Top {
  root?: Reference;
}
