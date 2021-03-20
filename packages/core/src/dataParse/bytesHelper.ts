import { str2U8a, u8a2Str, u8aConcat } from "@bfchain/comproto-helps";

const dvu8a = new Uint8Array(8);
const dv = new DataView(dvu8a.buffer);
class BytesHelper {
  /**可变长度的int */
  readVarInt = (function readVarIntSetup() {
    let value = 4294967295; // optimizer type-hint, tends to deopt otherwise (?!)
    return function readVarInt(ds: BFChainComproto.decoderState) {
      value = (ds.buffer[ds.offset] & 127) >>> 0;
      if (ds.buffer[ds.offset++] < 128) return value;
      value = (value | ((ds.buffer[ds.offset] & 127) << 7)) >>> 0;
      if (ds.buffer[ds.offset++] < 128) return value;
      value = (value | ((ds.buffer[ds.offset] & 127) << 14)) >>> 0;
      if (ds.buffer[ds.offset++] < 128) return value;
      value = (value | ((ds.buffer[ds.offset] & 127) << 21)) >>> 0;
      if (ds.buffer[ds.offset++] < 128) return value;
      value = (value | ((ds.buffer[ds.offset] & 15) << 28)) >>> 0;
      if (ds.buffer[ds.offset++] < 128) return value;

      /* istanbul ignore if */
      if ((ds.offset += 5) > ds.buffer.length) {
        ds.offset = ds.buffer.length;
        throw new RangeError(
          `fail to read VarInt, Index out of range: ${ds.offset} + 10 > ${ds.buffer.length}`,
        );
      }
      return value;
    };
  })();
  writeVarInt(
    val: number,
    buf: {
      [index: number]: number;
    },
    pos: number,
  ) {
    while (val > 127) {
      buf[pos++] = (val & 127) | 128;
      val >>>= 7;
    }
    buf[pos] = val;
  }

  len2Buf(length: number, buf: number[] = []) {
    this.writeVarInt(length, buf, 0);
    return buf;
  }
  get getLen() {
    Object.defineProperty(helper, "getLen", { value: this.readVarInt });
    return this.readVarInt;
  }
  readUint8(decoderState: BFChainComproto.decoderState) {
    return decoderState.buffer[decoderState.offset++];
  }
  readInt8(decoderState: BFChainComproto.decoderState) {
    const value = decoderState.buffer[decoderState.offset++];
    return value & 0x80 ? value - 0x100 : value;
  }
  readUint16(decoderState: BFChainComproto.decoderState) {
    let { buffer, offset } = decoderState;
    decoderState.offset += 2;
    return (buffer[offset++] << 8) | buffer[offset];
  }
  readInt16(decoderState: BFChainComproto.decoderState) {
    const { buffer, offset } = decoderState;
    decoderState.offset += 2;
    const value = (buffer[offset] << 8) | buffer[offset + 1];
    return value & 0x8000 ? value - 0x10000 : value;
  }
  readUint32(decoderState: BFChainComproto.decoderState) {
    const { buffer, offset } = decoderState;
    decoderState.offset += 4;
    return (
      buffer[offset] * 16777216 +
      (buffer[offset + 1] << 16) +
      (buffer[offset + 2] << 8) +
      buffer[offset + 3]
    );
  }
  readInt32(decoderState: BFChainComproto.decoderState) {
    const { buffer, offset } = decoderState;
    decoderState.offset += 4;
    return (
      (buffer[offset] << 24) |
      (buffer[offset + 1] << 16) |
      (buffer[offset + 2] << 8) |
      buffer[offset + 3]
    );
  }
  readUint64(decoderState: BFChainComproto.decoderState) {
    const { buffer, offset } = decoderState;
    decoderState.offset += 8;
    dvu8a[0] = buffer[offset];
    dvu8a[1] = buffer[offset + 1];
    dvu8a[2] = buffer[offset + 2];
    dvu8a[3] = buffer[offset + 3];
    dvu8a[4] = buffer[offset + 4];
    dvu8a[5] = buffer[offset + 5];
    dvu8a[6] = buffer[offset + 6];
    dvu8a[7] = buffer[offset + 7];
    return dv.getBigUint64(0);
  }
  readInt64(decoderState: BFChainComproto.decoderState) {
    const { buffer, offset } = decoderState;
    decoderState.offset += 8;
    dvu8a[0] = buffer[offset];
    dvu8a[1] = buffer[offset + 1];
    dvu8a[2] = buffer[offset + 2];
    dvu8a[3] = buffer[offset + 3];
    dvu8a[4] = buffer[offset + 4];
    dvu8a[5] = buffer[offset + 5];
    dvu8a[6] = buffer[offset + 6];
    dvu8a[7] = buffer[offset + 7];
    return dv.getBigInt64(0);
  }
  readFloat32(decoderState: BFChainComproto.decoderState) {
    const { buffer, offset } = decoderState;
    decoderState.offset += 4;
    dvu8a[0] = buffer[offset];
    dvu8a[1] = buffer[offset + 1];
    dvu8a[2] = buffer[offset + 2];
    dvu8a[3] = buffer[offset + 3];
    return dv.getFloat32(0);
  }
  readFloat64(decoderState: BFChainComproto.decoderState) {
    const { buffer, offset } = decoderState;
    decoderState.offset += 8;
    dvu8a[0] = buffer[offset];
    dvu8a[1] = buffer[offset + 1];
    dvu8a[2] = buffer[offset + 2];
    dvu8a[3] = buffer[offset + 3];
    dvu8a[4] = buffer[offset + 4];
    dvu8a[5] = buffer[offset + 5];
    dvu8a[6] = buffer[offset + 6];
    dvu8a[7] = buffer[offset + 7];
    return dv.getFloat64(0);
  }
  writeUint8(type: number, value: number) {
    const byteLength = 1;
    const u8a = new Uint8Array(byteLength + 1);
    u8a[0] = type;
    u8a[1] = value;
    return u8a;
  }
  get writeInt8() {
    Object.defineProperty(helper, "writeInt8", { value: helper.writeUint8 });
    return helper.writeUint8;
  }
  writeUint16(type: number, value: number) {
    const byteLength = 2;
    const u8a = new Uint8Array(1 + byteLength);
    u8a[0] = type;
    u8a[1] = value >> 8;
    u8a[2] = value /*  % 256 */;
    return u8a;
  }
  get writeInt16() {
    Object.defineProperty(helper, "writeInt16", { value: helper.writeUint16 });
    return helper.writeUint16;
  }
  writeUint32(type: number, value: number) {
    const byteLength = 4;
    const u8a = new Uint8Array(1 + byteLength);
    u8a[0] = type;
    u8a[1] = value >> 24;
    u8a[2] = value >> 16;
    u8a[3] = value >> 8;
    u8a[4] = value /*  % 256 */;
    return u8a;
  }
  get writeInt32() {
    Object.defineProperty(helper, "writeInt32", { value: helper.writeUint32 });
    return helper.writeUint32;
  }
  writeUint64(type: number, value: bigint) {
    const byteLength = 8;
    const u8a = new Uint8Array(1 + byteLength);
    u8a[0] = type;
    dv.setBigUint64(0, value);
    u8a[1] = dvu8a[0];
    u8a[2] = dvu8a[1];
    u8a[3] = dvu8a[2];
    u8a[4] = dvu8a[3];
    u8a[5] = dvu8a[4];
    u8a[6] = dvu8a[5];
    u8a[7] = dvu8a[6];
    u8a[8] = dvu8a[7];
    return u8a;
  }

  writeInt64(type: number, value: bigint) {
    const byteLength = 8;
    const u8a = new Uint8Array(1 + byteLength);
    u8a[0] = type;
    dv.setBigInt64(0, value);
    u8a[1] = dvu8a[0];
    u8a[2] = dvu8a[1];
    u8a[3] = dvu8a[2];
    u8a[4] = dvu8a[3];
    u8a[5] = dvu8a[4];
    u8a[6] = dvu8a[5];
    u8a[7] = dvu8a[6];
    u8a[8] = dvu8a[7];
    return u8a;
  }
  writeFloat32(type: number, value: number) {
    const byteLength = 4;
    const u8a = new Uint8Array(1 + byteLength);
    u8a[0] = type;
    dv.setFloat32(0, value);
    u8a[1] = dvu8a[0];
    u8a[2] = dvu8a[1];
    u8a[3] = dvu8a[2];
    u8a[4] = dvu8a[3];
    return u8a;
  }
  writeFloat64(type: number, value: number) {
    const byteLength = 8;
    const u8a = new Uint8Array(1 + byteLength);
    u8a[0] = type;
    dv.setFloat64(0, value);
    u8a[1] = dvu8a[0];
    u8a[2] = dvu8a[1];
    u8a[3] = dvu8a[2];
    u8a[4] = dvu8a[3];
    u8a[5] = dvu8a[4];
    u8a[6] = dvu8a[5];
    u8a[7] = dvu8a[6];
    u8a[8] = dvu8a[7];
    return u8a;
  }

  str2Buf(str: string) {
    const nameU8a = str2U8a(str);
    const nameSizeU8a = helper.len2Buf(nameU8a.byteLength);
    return u8aConcat([nameSizeU8a, nameU8a]);
  }
  readStringBuf(decoderState: BFChainComproto.decoderState) {
    const strLen = helper.getLen(decoderState);
    return u8a2Str(
      decoderState.buffer.subarray(decoderState.offset, (decoderState.offset += strLen)),
    );
  }

  private _dictBufCache = new Map<string, Uint8Array>();
  /**字典单词转二进制 */
  dict2Buf(word: string) {
    let u8a = this._dictBufCache.get(word);
    if (u8a === undefined) {
      const nameU8a = str2U8a(word);
      const nameSizeU8a = helper.len2Buf(nameU8a.byteLength);
      u8a = u8aConcat([nameSizeU8a, nameU8a]);
      this._dictBufCache.set(word, u8a);
    }
    return u8a;
  }
  private _dictTree = Object.create(null);
  /**读取单词 */
  readDict(decoderState: BFChainComproto.decoderState) {
    const dictLen = helper.getLen(decoderState);
    const start = decoderState.offset;
    const end = (decoderState.offset += dictLen);
    let key = "";
    for (let offset = start; offset < end; ++offset) {
      key += decoderState.buffer[offset] + ",";
    }
    let cache = this._dictTree[key];
    if (cache === undefined) {
      cache = u8a2Str(decoderState.buffer.subarray(start, end));
      this._dictTree[key] = cache;
    }
    return cache;
  }
}

const helper = new BytesHelper();
export default helper;
