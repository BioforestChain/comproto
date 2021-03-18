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
      arrayBuf[index++] = 0xc0 | (chr >>> 6);
      arrayBuf[index++] = 0x80 | (chr & 0x3f);
    } else if (chr < 0xd800 || chr > 0xdfff) {
      // 3 bytes
      arrayBuf[index++] = 0xe0 | (chr >>> 12);
      arrayBuf[index++] = 0x80 | ((chr >>> 6) & 0x3f);
      arrayBuf[index++] = 0x80 | (chr & 0x3f);
    } else {
      // 4 bytes - surrogate pair
      chr = (((chr - 0xd800) << 10) | (data.charCodeAt(i++) - 0xdc00)) + 0x10000;
      arrayBuf[index++] = 0xf0 | (chr >>> 18);
      arrayBuf[index++] = 0x80 | ((chr >>> 12) & 0x3f);
      arrayBuf[index++] = 0x80 | ((chr >>> 6) & 0x3f);
      arrayBuf[index++] = 0x80 | (chr & 0x3f);
    }
  }
  return new Uint8Array(arrayBuf);
};
