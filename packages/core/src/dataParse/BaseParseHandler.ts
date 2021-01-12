
import { BBuffer } from '@bfchain/util-buffer';

export default class BaseParseHandler {
    constructor() {
    }
    len2Buf(length: number) {
        const type = (length < 16)
        ? (0x80 + length)
        :(length <= 0xFFFF)
        ? 0xde
        : 0xdf;
    }
    // writeInt8(buf: Uint8Array, start: number) {
    //     const value = buf[start];
    //     return (value & 0x80) ? value - 0x100 : value;
    // }
    readUint8(buf: Uint8Array, start: number) {
        return buf[start];
    }
    readInt8(buffer: Uint8Array, start: number) {
        const value = buffer[start];
        return (value & 0x80) ? value - 0x100 : value;
    }
    readUint16(buffer: Uint8Array, start: number) {
        return (buffer[start++] << 8) | buffer[start]
    }
    readInt16(buffer: Uint8Array, start: number) {
        const value = (buffer[start++] << 8) | buffer[start];
        return (value & 0x8000) ? value - 0x10000 : value;
    }
    readUint32(buffer: Uint8Array, start: number) {
        return (buffer[start++] * 16777216) + (buffer[start++] << 16)
        + (buffer[start++] << 8) + buffer[start];
    }
    readInt32(buffer: Uint8Array, start: number) {
        return (buffer[start++] << 24) | (buffer[start++] << 16)
        | (buffer[start++] << 8) | buffer[start];
    }
    readUint64(buffer: Uint8Array, start: number) {
        return BBuffer.prototype.readBigUInt64BE.call(buffer, start);
    }
    readInt64(buffer: Uint8Array, start: number) {
        return BBuffer.prototype.readBigInt64BE.call(buffer, start);
    }
    readFloat32(buffer: Uint8Array, start: number) {
        return BBuffer.prototype.readFloatBE.call(buffer, start);
    }
    readFloat64(buffer: Uint8Array, start: number) {
        return BBuffer.prototype.readDoubleBE.call(buffer, start);
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
