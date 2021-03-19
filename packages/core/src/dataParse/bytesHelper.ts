const dvu8a = new Uint8Array(8);
const dv = new DataView(dvu8a.buffer);

const helper = new (class BytesHelper {
  len2Buf(length: number) {
    if (length < 0xff) {
      return helper.writeUint8(0x00, length);
    }
    if (length <= 0xffff) {
      return helper.writeUint16(0x01, length);
    }
    return helper.writeUint32(0x02, length);
  }
  getLen(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset++];
    switch (tag) {
      case 0x00:
        return helper.readUint8(decoderState);

      case 0x01:
        return helper.readUint16(decoderState);

      case 0x02:
        return helper.readUint32(decoderState);
    }
    throw `string handler not tag::${tag}`;
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
})();

export default helper;
