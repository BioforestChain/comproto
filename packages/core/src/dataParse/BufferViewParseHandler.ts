import { dataTypeEnum } from "../const";
import type { Comproto } from "../Comproto";
import helper from "./bytesHelper";
import { u8aConcat } from "@bfchain/comproto-helps";

const enum ARRAY_BUFFRE_TYPE {
  Int8,
  Uint8,
  Uint8Clamped,
  Int16,
  Uint16,
  Int32,
  Uint32,
  Float32,
  Float64,
  BigInt64,
  BigUint64,
}

export default class BufferViewParseHandler implements BFChainComproto.TypeTransferHandler<ArrayBufferView> {
  constructor(comproto: Comproto) {
    comproto.setTypeHandler(this);
    comproto.setTagType(0xc4, dataTypeEnum.BufferView);
    comproto.setTagType(0xc5, dataTypeEnum.BufferView);
    comproto.setTagType(0xc6, dataTypeEnum.BufferView);
  }
  typeName = dataTypeEnum.BufferView;
  serialize(data: ArrayBufferView, resRef: BFChainComproto.U8AList) {
    const byteLen = data.byteLength;
    const headBuf = this.length2Buf(byteLen);
    let buffer: ARRAY_BUFFRE_TYPE;
    switch (data.constructor) {
      case Int8Array:
        buffer = ARRAY_BUFFRE_TYPE.Int8;
        break;
      case Uint8Array:
        buffer = ARRAY_BUFFRE_TYPE.Uint8;
        break;
      case Uint8ClampedArray:
        buffer = ARRAY_BUFFRE_TYPE.Uint8Clamped;
        break;
      case Int16Array:
        buffer = ARRAY_BUFFRE_TYPE.Int16;
        break;
      case Uint16Array:
        buffer = ARRAY_BUFFRE_TYPE.Uint16;
        break;
      case Int32Array:
        buffer = ARRAY_BUFFRE_TYPE.Int32;
        break;
      case Uint32Array:
        buffer = ARRAY_BUFFRE_TYPE.Uint32;
        break;
      case Float32Array:
        buffer = ARRAY_BUFFRE_TYPE.Float32;
        break;
      case Float64Array:
        buffer = ARRAY_BUFFRE_TYPE.Float64;
        break;
      case BigInt64Array:
        buffer = ARRAY_BUFFRE_TYPE.BigInt64;
        break;
      case BigUint64Array:
        buffer = ARRAY_BUFFRE_TYPE.BigUint64;
        break;
      default:
        throw new TypeError("unknown arraybufferview " + data.constructor.name);
    }

    resRef.push(headBuf, [buffer], new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
  }
  deserialize(decoderState: BFChainComproto.decoderState) {
    const len = this.getLength(decoderState);
    const bufferType = decoderState.buffer[decoderState.offset];
    interface ArrayBufferViewConstructor {
      new (buffer: ArrayBufferLike, byteOffset?: number, byteLength?: number): ArrayBufferView;
    }
    let ctor: ArrayBufferViewConstructor;
    switch (bufferType) {
      case ARRAY_BUFFRE_TYPE.Int8:
        ctor = Int8Array;
        break;
      case ARRAY_BUFFRE_TYPE.Uint8:
        ctor = Uint8Array;
        break;
      case ARRAY_BUFFRE_TYPE.Uint8Clamped:
        ctor = Uint8ClampedArray;
        break;
      case ARRAY_BUFFRE_TYPE.Int16:
        ctor = Int16Array;
        break;
      case ARRAY_BUFFRE_TYPE.Uint16:
        ctor = Uint16Array;
        break;
      case ARRAY_BUFFRE_TYPE.Int32:
        ctor = Int32Array;
        break;
      case ARRAY_BUFFRE_TYPE.Uint32:
        ctor = Uint32Array;
        break;
      case ARRAY_BUFFRE_TYPE.Float32:
        ctor = Float32Array;
        break;
      case ARRAY_BUFFRE_TYPE.Float64:
        ctor = Float64Array;
        break;
      case ARRAY_BUFFRE_TYPE.BigInt64:
        ctor = BigInt64Array;
        break;
      case ARRAY_BUFFRE_TYPE.BigUint64:
        ctor = BigUint64Array;
        break;
      default:
        throw new TypeError("unknown arraybufferview type" + bufferType);
    }

    ++decoderState.offset;
    const buf = decoderState.buffer.slice(decoderState.offset, decoderState.offset + len);
    decoderState.offset += len;
    return new ctor(buf);
  }
  private length2Buf(len: number) {
    if (len < 0xff) {
      return helper.writeUint8(0xc4, len);
    } else if (len <= 0xffff) {
      return helper.writeUint16(0xc5, len);
    } else {
      return helper.writeUint32(0xc6, len);
    }
  }
  private getLength(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset++];
    switch (tag) {
      case 0xc4:
        return helper.readUint8(decoderState);
      case 0xc5:
        return helper.readUint16(decoderState);
      case 0xc6:
        return helper.readUint32(decoderState);
    }
    throw `can not handler tag::${tag}`;
  }
}

// const TIMES = 1e7;

// let buffer: ARRAY_BUFFRE_TYPE | undefined;
// let ctor: any = Int8Array;
// {
//   console.time("if-else");
//   for (let i = 0; i < TIMES; i++) {
//     if (ctor === Int8Array) {
//       buffer = ARRAY_BUFFRE_TYPE.Int8;
//     } else if (ctor === Uint8Array) {
//       buffer = ARRAY_BUFFRE_TYPE.Uint8;
//     } else if (ctor === Uint8ClampedArray) {
//       buffer = ARRAY_BUFFRE_TYPE.Uint8Clamped;
//     } else if (ctor === Int16Array) {
//       buffer = ARRAY_BUFFRE_TYPE.Int16;
//     } else if (ctor === Uint16Array) {
//       buffer = ARRAY_BUFFRE_TYPE.Uint16;
//     } else if (ctor === Int32Array) {
//       buffer = ARRAY_BUFFRE_TYPE.Int32;
//     } else if (ctor === Uint32Array) {
//       buffer = ARRAY_BUFFRE_TYPE.Uint32;
//     } else if (ctor === Float32Array) {
//       buffer = ARRAY_BUFFRE_TYPE.Float32;
//     } else if (ctor === Float64Array) {
//       buffer = ARRAY_BUFFRE_TYPE.Float64;
//     } else if (ctor === BigInt64Array) {
//       buffer = ARRAY_BUFFRE_TYPE.BigInt64;
//     } else if (ctor === BigUint64Array) {
//       buffer = ARRAY_BUFFRE_TYPE.BigUint64;
//     } else {
//       throw new TypeError("unknown arraybufferview " + ctor.name);
//     }
//   }
//   console.timeEnd("if-else");
//   console.log(buffer);
// }
// {
//   console.time("switch");
//   for (let i = 0; i < TIMES; i++) {
//     switch (ctor) {
//       case Int8Array:
//         buffer = ARRAY_BUFFRE_TYPE.Int8;
//         break;
//       case Uint8Array:
//         buffer = ARRAY_BUFFRE_TYPE.Uint8;
//         break;
//       case Uint8ClampedArray:
//         buffer = ARRAY_BUFFRE_TYPE.Uint8Clamped;
//         break;
//       case Int16Array:
//         buffer = ARRAY_BUFFRE_TYPE.Int16;
//         break;
//       case Uint16Array:
//         buffer = ARRAY_BUFFRE_TYPE.Uint16;
//         break;
//       case Int32Array:
//         buffer = ARRAY_BUFFRE_TYPE.Int32;
//         break;
//       case Uint32Array:
//         buffer = ARRAY_BUFFRE_TYPE.Uint32;
//         break;
//       case Float32Array:
//         buffer = ARRAY_BUFFRE_TYPE.Float32;
//         break;
//       case Float64Array:
//         buffer = ARRAY_BUFFRE_TYPE.Float64;
//         break;
//       case BigInt64Array:
//         buffer = ARRAY_BUFFRE_TYPE.BigInt64;
//         break;
//       case BigUint64Array:
//         buffer = ARRAY_BUFFRE_TYPE.BigUint64;
//         break;
//       default:
//         throw new TypeError("unknown arraybufferview " + ctor.name);
//     }
//   }
//   console.timeEnd("switch");
//   console.log(buffer);
// }

// {
//   const _ctorNameTypeHashMap = (() => {
//     const hm: { [name: string]: ARRAY_BUFFRE_TYPE } = Object.create(null);
//     hm["Int8Array"] = ARRAY_BUFFRE_TYPE.Int8;
//     hm["Uint8Array"] = ARRAY_BUFFRE_TYPE.Uint8;
//     hm["Uint8ClampedArray"] = ARRAY_BUFFRE_TYPE.Uint8Clamped;
//     hm["Int16Array"] = ARRAY_BUFFRE_TYPE.Int16;
//     hm["Uint16Array"] = ARRAY_BUFFRE_TYPE.Uint16;
//     hm["Int32Array"] = ARRAY_BUFFRE_TYPE.Int32;
//     hm["Uint32Array"] = ARRAY_BUFFRE_TYPE.Uint32;
//     hm["Float32Array"] = ARRAY_BUFFRE_TYPE.Float32;
//     hm["Float64Array"] = ARRAY_BUFFRE_TYPE.Float64;
//     hm["BigInt64Array"] = ARRAY_BUFFRE_TYPE.BigInt64;
//     hm["BigUint64Array"] = ARRAY_BUFFRE_TYPE.BigUint64;
//     return hm;
//   })();
//   let ctor: any = BigUint64Array;
//   console.time("hashmap");
//   for (let i = 0; i < TIMES; i++) {
//     const buffer = _ctorNameTypeHashMap[ctor.name];
//     if (buffer === undefined) {
//       throw new TypeError("unknown arraybufferview " + ctor.name);
//     }
//   }
//   console.timeEnd("hashmap");
//   console.log(buffer);
// }
