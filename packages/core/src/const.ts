export const enum dataTypeEnum {
  Null = "null",
  Undefined = "undefined",
  BigInt = "bigint",
  Number = "number",
  String = "string",
  Boolean = "boolean",

  Object = "Object",
  Array = "Array",
  Map = "Map",
  Set = "Set",
  BufferView = "BufferView",
  ArrayBuffer = "ArrayBuffer",

  Ext = "Ext",
}

export enum SerializationTag {
  kUndefined = 0xc1,
  kNull = 0xc0,
  kTrue = 0xc3,
  kFalse = 0xc2,
}
