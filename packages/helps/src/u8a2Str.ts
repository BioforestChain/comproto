export const u8a2Str = (buffer: Uint8Array, offset: number = 0 , length: number = buffer.length) => {
    let chr = 0;
    let string = '';
    let index = offset | 0;
    const end = offset + length;
    while (index < end) {
        chr = buffer[index++];
        if (chr < 128) {
            string += String.fromCharCode(chr);
            continue;
        }

        if ((chr & 0xE0) === 0xC0) {
        // 2 bytes
        chr = (chr & 0x1F) << 6 |
                (buffer[index++] & 0x3F);

        } else if ((chr & 0xF0) === 0xE0) {
        // 3 bytes
        chr = (chr & 0x0F)             << 12 |
                (buffer[index++] & 0x3F) << 6  |
                (buffer[index++] & 0x3F);

        } else if ((chr & 0xF8) === 0xF0) {
        // 4 bytes
        chr = (chr & 0x07)             << 18 |
                (buffer[index++] & 0x3F) << 12 |
                (buffer[index++] & 0x3F) << 6  |
                (buffer[index++] & 0x3F);
        }
        if (chr >= 0x010000) {
        // A surrogate pair
        chr -= 0x010000;
            string += String.fromCharCode((chr >>> 10) + 0xD800, (chr & 0x3FF) + 0xDC00);
        } else {
            string += String.fromCharCode(chr);
        }
    }

    return string;
}
