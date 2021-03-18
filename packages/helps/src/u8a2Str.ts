let u8a2Str: (data: Uint8Array) => string;
if (typeof TextDecoder === "function") {
  const decoder = new TextDecoder();
  u8a2Str = decoder.decode.bind(decoder);
} else {
  u8a2Str = (buffer: Uint8Array, offset: number = 0, length: number = buffer.length) => {
    let chr = 0;
    let string = "";
    let index = offset | 0;
    const end = offset + length;
    while (index < end) {
      chr = buffer[index++];
      if (chr < 128) {
        string += String.fromCharCode(chr);
        continue;
      }

      if ((chr & 0xe0) === 0xc0) {
        // 2 bytes
        chr = ((chr & 0x1f) << 6) | (buffer[index++] & 0x3f);
      } else if ((chr & 0xf0) === 0xe0) {
        // 3 bytes
        chr = ((chr & 0x0f) << 12) | ((buffer[index++] & 0x3f) << 6) | (buffer[index++] & 0x3f);
      } else if ((chr & 0xf8) === 0xf0) {
        // 4 bytes
        chr =
          ((chr & 0x07) << 18) |
          ((buffer[index++] & 0x3f) << 12) |
          ((buffer[index++] & 0x3f) << 6) |
          (buffer[index++] & 0x3f);
      }
      if (chr >= 0x010000) {
        // A surrogate pair
        chr -= 0x010000;
        string += String.fromCharCode((chr >>> 10) + 0xd800, (chr & 0x3ff) + 0xdc00);
      } else {
        string += String.fromCharCode(chr);
      }
    }

    return string;
  };
}
export { u8a2Str };
