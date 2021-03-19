import { dataTypeEnum } from "../const";
import type { Comproto } from "../Comproto";
import BaseParseHandler from "./BaseParseHandler";
import { u8aConcat } from "@bfchain/comproto-helps";

const enum ARRAY_BUFFRE_TYPE {
  Int8,
  Uint8,
  Uint8C,
  Int16,
  Uint16,
  Int32,
  Uint32,
  BigInt64,
  BigUint64,
  Float32,
  Float64,
}

export default class BufferViewParseHandler
  extends BaseParseHandler
  implements BFChainComproto.typeTransferHandler<ArrayBufferView> {
  constructor(comproto: Comproto) {
    super();
    comproto.setTypeHandler(this);
    comproto.setTagType(0xc4, dataTypeEnum.BufferView);
    comproto.setTagType(0xc5, dataTypeEnum.BufferView);
    comproto.setTagType(0xc6, dataTypeEnum.BufferView);
  }
  typeName = dataTypeEnum.BufferView;
  serialize(data: ArrayBufferView) {
    const byteLen = data.byteLength;
    const headBuf = this.len2Buf(byteLen);
    let buffer: ARRAY_BUFFRE_TYPE;
    switch (data.constructor) {
      case Int8Array:
        buffer = ARRAY_BUFFRE_TYPE.Int8;
        break;
      case Uint8Array:
        buffer = ARRAY_BUFFRE_TYPE.Uint8;
        break;
      case Uint8ClampedArray:
        buffer = ARRAY_BUFFRE_TYPE.Uint8C;
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

    return u8aConcat([
      headBuf,
      [buffer],
      new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
    ]);
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
      case ARRAY_BUFFRE_TYPE.Uint8C:
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
  len2Buf(len: number) {
    if (len < 0xff) {
      return this.writeUint8(0xc4, len);
    } else if (len <= 0xffff) {
      return this.writeUint16(0xc5, len);
    } else {
      return this.writeUint32(0xc6, len);
    }
  }
  getLength(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset++];
    switch (tag) {
      case 0xc4:
        return this.readUint8(decoderState);
        break;
      case 0xc5:
        return this.readUint16(decoderState);
        break;
      case 0xc6:
        return this.readUint32(decoderState);
        break;
    }
    throw `can not handler tag::${tag}`;
  }
}
