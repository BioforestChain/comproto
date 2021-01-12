
type handler = (val: unknown) => Uint8Array;

export default class BaseParseHandler {
    /** immediate values */
    protected tokenMap!: Map<number, handler>;
    constructor() {
    }
    len2Buf(length: number) {
        const type = (length < 16)
        ? (0x80 + length)
        :(length <= 0xFFFF)
        ? 0xde
        : 0xdf;
    }
    
    write1(type: number, value: number) {
        return [type, value];
    }
    write2(type: number, value: number) {
        return [type, value >>> 8, value];
    }
    
    write4(type: number, value: number) {
        return new Uint8Array([type, value >>> 24, value >>> 16, value >>> 8, value]);
    }
    read1(buf: Uint8Array, start: number) {
        const value = buf[start];
        return (value & 0x80) ? value - 0x100 : value;
    }
    read2(buffer: Uint8Array, start: number) {
        const value = (buffer[start++] << 8) | buffer[start];
        return (value & 0x8000) ? value - 0x10000 : value;
    }
    read4(buffer: Uint8Array, start: number) {
        return (buffer[start++] * 16777216) + (buffer[start++] << 16)
        + (buffer[start++] << 8) + buffer[start];
    }
    writeN1(type: number, value: number) {
        
    }
    writeN2(type: number, value: number) {
        
    }
    writeN4(type: number, value: number) {
        
    }
}
