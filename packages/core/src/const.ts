export enum dataTypeEnum {
    Undefined = 'Undefined',
    Object = 'Object',
    Array = 'Array',
    BigInt = 'BigInt',
    Number = 'Number',
    String = 'String',
    Map = 'Map',
    Set = 'Set',
    Null = 'Null',
    Boolean = 'Boolean',
    Ext = 'Ext',
    BufferView = 'BufferView',
    ArrayBuffer = 'ArrayBuffer',
};

export enum SerializationTag {
    kUndefined = 0xc1,
    kNull = 0xc0,
    kTrue = 0xc3,
    kFalse = 0xc2,
};
