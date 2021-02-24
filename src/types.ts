import R from "ramda";

export type ObjectType = boolean /*| { type: "Buffer", data: number[] }*/ | number | string | ArchivedItem | NSClassInfo;

export interface Top {
  root?: Reference;
}

export type ArchivedItem = { $class: Reference };

export interface NSKeyedArchive {
  $version: 100000;
  $archiver: 'NSKeyedArchiver';
  $top: Top;
  $objects: ObjectType[];
}

export interface Reference {
  UID: number;
}

export interface NSClassInfo {
  $classname: ClassName;
  $classes: ClassName[];
}

export type RealisedClass =
  | ClassName.NSArray
  | ClassName.NSDictionary
  | ClassName.NSMutableArray
  | ClassName.NSMutableDictionary
  | ClassName.NSMutableString
  | ClassName.NSValue;

export enum ClassName {
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

export interface NSArray extends ArchivedItem {
  'NS.objects': Reference[]
}

export interface NSDictionary extends ArchivedItem {
  $class: Reference,
  'NS.keys': Reference[]
  'NS.objects': Reference[]
}

export interface NSString extends ArchivedItem {
  'NS.string': string
}

interface NSRect {
  'NS.special': NSSpecialValueTypes.NSRect
  'NS.rectval': Reference
}

interface NSSize {
  'NS.special': NSSpecialValueTypes.NSSize
  'NS.sizeval': Reference
}

export type NSValue = ArchivedItem & (NSRect | NSSize)
