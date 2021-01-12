
export const str2U8a = (data: string) => {
    const arrayBuf = [];
    let index = 0;
    const length = data.length;
    let chr = 0;
    let i = 0;
    while (i < length) {
        chr = data.charCodeAt(i++);
        if (chr < 128) {
            arrayBuf[index++] = chr;
        } else if (chr < 0x800) {
            // 2 bytes
            arrayBuf[index++] = 0xC0 | (chr >>> 6);
            arrayBuf[index++] = 0x80 | (chr & 0x3F);
        } else if (chr < 0xD800 || chr > 0xDFFF) {
            // 3 bytes
            arrayBuf[index++] = 0xE0 | (chr  >>> 12);
            arrayBuf[index++] = 0x80 | ((chr >>> 6)  & 0x3F);
            arrayBuf[index++] = 0x80 | (chr          & 0x3F);
        } else {
            // 4 bytes - surrogate pair
            chr = (((chr - 0xD800) << 10) | (data.charCodeAt(i++) - 0xDC00)) + 0x10000;
            arrayBuf[index++] = 0xF0 | (chr >>> 18);
            arrayBuf[index++] = 0x80 | ((chr >>> 12) & 0x3F);
            arrayBuf[index++] = 0x80 | ((chr >>> 6)  & 0x3F);
            arrayBuf[index++] = 0x80 | (chr          & 0x3F);
        }
    }
    return new Uint8Array(arrayBuf);
}
