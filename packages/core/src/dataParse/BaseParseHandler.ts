import { BBuffer } from '@bfchain/util-buffer';


export default class BaseParseHandler {
    readUint8(decoderState: BFChainComproto.decoderState) {
        return decoderState.buffer[decoderState.offset ++];
    }
    readInt8(decoderState: BFChainComproto.decoderState) {
        const value = decoderState.buffer[decoderState.offset ++];
        return (value & 0x80) ? value - 0x100 : value;
    }
    readUint16(decoderState: BFChainComproto.decoderState) {
        let { buffer, offset } = decoderState;
        decoderState.offset += 2;
        return (buffer[offset ++] << 8) | buffer[offset];
    }
    readInt16(decoderState: BFChainComproto.decoderState) {
        let { buffer, offset } = decoderState;
        decoderState.offset += 2;
        const value = (buffer[offset++] << 8) | buffer[offset];
        return (value & 0x8000) ? value - 0x10000 : value;
    }
    readUint32(decoderState: BFChainComproto.decoderState) {
        let { buffer, offset } = decoderState;
        decoderState.offset += 4;
        return (buffer[offset++] * 16777216) + (buffer[offset++] << 16)
        + (buffer[offset++] << 8) + buffer[offset];
    }
    readInt32(decoderState: BFChainComproto.decoderState) {
        let { buffer, offset } = decoderState;
        decoderState.offset += 4;
        return (buffer[offset++] << 24) | (buffer[offset++] << 16)
        | (buffer[offset++] << 8) | buffer[offset];
    }
    readUint64(decoderState: BFChainComproto.decoderState) {
        const { buffer, offset } = decoderState;
        decoderState.offset += 8;
        return BBuffer.prototype.readBigUInt64BE.call(buffer, offset);
    }
    readInt64(decoderState: BFChainComproto.decoderState) {
        const { buffer, offset } = decoderState;
        decoderState.offset += 8;
        return BBuffer.prototype.readBigInt64BE.call(buffer, offset);
    }
    readFloat32(decoderState: BFChainComproto.decoderState) {
        const { buffer, offset } = decoderState;
        decoderState.offset += 4;
        return BBuffer.prototype.readFloatBE.call(buffer, offset);
    }
    readFloat64(decoderState: BFChainComproto.decoderState) {
        const { buffer, offset } = decoderState;
        decoderState.offset += 8;
        return BBuffer.prototype.readDoubleBE.call(buffer, offset);
    }
    writeUint8(type: number, value: number) {
        const byteLength = 1;
        const u8a = new Uint8Array(byteLength + 1);
        u8a[0] = type;
        BBuffer.prototype.writeUInt8.call(u8a, value, 1);
        return u8a;
    }
    writeUint16(type: number, value: number) {
        const byteLength = 2;
        const u8a = new Uint8Array(1 + byteLength);
        u8a[0] = type;
        BBuffer.prototype.writeUInt16BE.call(u8a, value, 1);
        return u8a;
    }
    writeUint32(type: number, value: number) {
        const byteLength = 4;
        const u8a = new Uint8Array(1 + byteLength);
        u8a[0] = type;
        BBuffer.prototype.writeUInt32BE.call(u8a, value, 1);
        return u8a;
    }
    writeUint64(type: number, value: bigint) {
        const byteLength = 8;
        const u8a = new Uint8Array(1 + byteLength);
        u8a[0] = type;
        BBuffer.prototype.writeBigUInt64BE.call(u8a, value, 1);
        return u8a;
    }
    writeInt8(type: number, value: number) {
        const byteLength = 1;
        const u8a = new Uint8Array(byteLength + 1);
        u8a[0] = type;
        BBuffer.prototype.writeInt8.call(u8a, value, 1);
        return u8a;
    }
    writeInt16(type: number, value: number) {
        const byteLength = 2;
        const u8a = new Uint8Array(1 + byteLength);
        u8a[0] = type;
        BBuffer.prototype.writeInt16BE.call(u8a, value, 1);
        return u8a;
    }
    writeInt32(type: number, value: number) {
        const byteLength = 4;
        const u8a = new Uint8Array(1 + byteLength);
        u8a[0] = type;
        BBuffer.prototype.writeInt32BE.call(u8a, value, 1);
        return u8a;
    }
    writeInt64(type: number, value: bigint) {
        const byteLength = 8;
        const u8a = new Uint8Array(1 + byteLength);
        u8a[0] = type;
        BBuffer.prototype.writeBigInt64BE.call(u8a, value, 1);
        return u8a;
    }
    writeFloat32(type: number, value: number) {
        const byteLength = 4;
        const u8a = new Uint8Array(1 + byteLength);
        u8a[0] = type;
        BBuffer.prototype.writeFloatBE.call(u8a, value, 1);
        return u8a;
    }
    writeFloat64(type: number, value: number) {
        const byteLength = 8;
        const u8a = new Uint8Array(1 + byteLength);
        u8a[0] = type;
        BBuffer.prototype.writeDoubleBE.call(u8a, value, 1);
        return u8a;
    }
}
