const u8a2dataView = (u8a: Uint8Array) => {
  return new DataView(u8a.buffer);
};

export default class BaseParseHandler {
  len2Buf(length: number) {
    if (length < 0xff) {
      return this.writeUint8(0x00, length);
    }
    if (length <= 0xffff) {
      return this.writeUint16(0x01, length);
    }
    return this.writeFloat32(0x02, length);
  }
  getLen(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset++];
    switch (tag) {
      case 0x00:
        return this.readUint8(decoderState);

      case 0x01:
        return this.readUint16(decoderState);

      case 0x02:
        return this.readUint32(decoderState);
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
    let { buffer, offset } = decoderState;
    decoderState.offset += 2;
    const value = (buffer[offset++] << 8) | buffer[offset];
    return value & 0x8000 ? value - 0x10000 : value;
  }
  readUint32(decoderState: BFChainComproto.decoderState) {
    let { buffer, offset } = decoderState;
    decoderState.offset += 4;
    return (
      buffer[offset++] * 16777216 +
      (buffer[offset++] << 16) +
      (buffer[offset++] << 8) +
      buffer[offset]
    );
  }
  readInt32(decoderState: BFChainComproto.decoderState) {
    let { buffer, offset } = decoderState;
    decoderState.offset += 4;
    return (
      (buffer[offset++] << 24) | (buffer[offset++] << 16) | (buffer[offset++] << 8) | buffer[offset]
    );
  }
  readUint64(decoderState: BFChainComproto.decoderState) {
    const { buffer, offset } = decoderState;
    decoderState.offset += 8;
    return u8a2dataView(buffer).getBigUint64(offset);
  }
  readInt64(decoderState: BFChainComproto.decoderState) {
    const { buffer, offset } = decoderState;
    decoderState.offset += 8;
    return u8a2dataView(buffer).getBigInt64(offset);
  }
  readFloat32(decoderState: BFChainComproto.decoderState) {
    const { buffer, offset } = decoderState;
    decoderState.offset += 4;
    return u8a2dataView(buffer).getFloat32(offset);
  }
  readFloat64(decoderState: BFChainComproto.decoderState) {
    const { buffer, offset } = decoderState;
    decoderState.offset += 8;
    return u8a2dataView(buffer).getFloat64(offset);
  }
  writeUint8(type: number, value: number) {
    const byteLength = 1;
    const u8a = new Uint8Array(byteLength + 1);
    u8a[0] = type;
    u8a2dataView(u8a).setUint8(1, value);
    return u8a;
  }
  writeUint16(type: number, value: number) {
    const byteLength = 2;
    const u8a = new Uint8Array(1 + byteLength);
    u8a[0] = type;
    u8a2dataView(u8a).setUint16(1, value);
    return u8a;
  }
  writeUint32(type: number, value: number) {
    const byteLength = 4;
    const u8a = new Uint8Array(1 + byteLength);
    u8a[0] = type;
    u8a2dataView(u8a).setUint32(1, value);
    return u8a;
  }
  writeUint64(type: number, value: bigint) {
    const byteLength = 8;
    const u8a = new Uint8Array(1 + byteLength);
    u8a[0] = type;
    u8a2dataView(u8a).setBigUint64(1, value);
    return u8a;
  }
  writeInt8(type: number, value: number) {
    const byteLength = 1;
    const u8a = new Uint8Array(byteLength + 1);
    u8a[0] = type;
    u8a2dataView(u8a).setInt8(1, value);
    return u8a;
  }
  writeInt16(type: number, value: number) {
    const byteLength = 2;
    const u8a = new Uint8Array(1 + byteLength);
    u8a[0] = type;
    u8a2dataView(u8a).setInt16(1, value);
    return u8a;
  }
  writeInt32(type: number, value: number) {
    const byteLength = 4;
    const u8a = new Uint8Array(1 + byteLength);
    u8a[0] = type;
    u8a2dataView(u8a).setInt32(1, value);
    return u8a;
  }
  writeInt64(type: number, value: bigint) {
    const byteLength = 8;
    const u8a = new Uint8Array(1 + byteLength);
    u8a[0] = type;
    u8a2dataView(u8a).setBigInt64(1, value);
    return u8a;
  }
  writeFloat32(type: number, value: number) {
    const byteLength = 4;
    const u8a = new Uint8Array(1 + byteLength);
    u8a[0] = type;
    u8a2dataView(u8a).setFloat32(1, value);
    return u8a;
  }
  writeFloat64(type: number, value: number) {
    const byteLength = 8;
    const u8a = new Uint8Array(1 + byteLength);
    u8a[0] = type;
    u8a2dataView(u8a).setFloat64(1, value);
    return u8a;
  }
}
