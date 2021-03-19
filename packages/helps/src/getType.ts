export const getDataType = (data: unknown): string => {
  const type = typeof data;
  if (type !== "object") {
    return type;
  }
  if (data === null) {
    return "null";
  }
  const flagType = (data as any)[TYPE_FLAG];
  if (flagType in TYPE_HASH_MAP) {
    return flagType;
  }
  const typeStr = Object.prototype.toString.call(data);
  return typeStr.slice(8, -1);
};

const TYPE_FLAG = Symbol();
const TYPE_HASH_MAP = Object.create(null);

const defineFlag = (Ctor: Function, name: string) => {
  TYPE_HASH_MAP[name] = true;
  Object.defineProperty(Ctor.prototype, TYPE_FLAG, {
    enumerable: false,
    configurable: false,
    value: name,
  });
};
defineFlag(ArrayBuffer, "ArrayBuffer");
if (typeof SharedArrayBuffer === "function") {
  defineFlag(SharedArrayBuffer, "ArrayBuffer");
}

defineFlag(Map, "Map");
defineFlag(Set, "Set");

defineFlag(Int8Array, "BufferView");
defineFlag(Uint8Array, "BufferView");
defineFlag(Uint8ClampedArray, "BufferView");
defineFlag(Int16Array, "BufferView");
defineFlag(Uint16Array, "BufferView");
defineFlag(Int32Array, "BufferView");
defineFlag(Uint32Array, "BufferView");
defineFlag(Float32Array, "BufferView");
defineFlag(Float64Array, "BufferView");
defineFlag(BigInt64Array, "BufferView");
defineFlag(BigUint64Array, "BufferView");
defineFlag(Array, "Array");
defineFlag(Object, "Object");

Object.freeze(TYPE_HASH_MAP);

// const TIMES = 1e6;
// const a = {};
// {
//   console.time("proto");
//   let type;
//   for (let i = 0; i < TIMES; i++) {
//     const flagType = (a as any)[TYPE_FLAG];
//     if (flagType in TYPE_HASH_MAP) {
//       type = flagType;
//     }
//   }
//   console.timeEnd("proto");
//   console.log(type);
// }

// {
//   console.time("toString");
//   let type;
//   for (let i = 0; i < TIMES; i++) {
//     const typeStr = Object.prototype.toString.call(a);
//     type = typeStr.slice(8, -1);
//   }
//   console.timeEnd("toString");
//   console.log(type);
// }
