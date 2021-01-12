import { dataTypeEnum, SerializationTag } from '../const';
import type { Comproto } from '../Comproto';
import BaseParseHandler from './BaseParseHandler';
export default class StringParseHandler
    extends BaseParseHandler
    implements BFChainComproto.typeTransferHandler<string> {
    /**
     *  fixstr -- 0xa0 - 0xbf
     *  str 8 -- 0xd9
     *  str 16 -- 0xda
     *  str 32 -- 0xdb
     */
    constructor(comproto: Comproto) {
        super();
        comproto.setTypeHandler(this);
        for(let i = 0xa0; i < 0xbf; i++) {
            comproto.setTagType(i, dataTypeEnum.String);
        }
        comproto.setTagType(0xd9, dataTypeEnum.String);
        comproto.setTagType(0xda, dataTypeEnum.String);
        comproto.setTagType(0xdb, dataTypeEnum.String);
    }
    typeName = dataTypeEnum.String;
    serialize(data: string) {
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
        const byteLen = arrayBuf.length;
        const headLenArr = this.strByteLen2buf(byteLen);
        return new Uint8Array([...headLenArr, ...arrayBuf]);
    }
    deserialize(buffer: Uint8Array, tagOffset: number) {
        const tag = buffer[tagOffset ++];
        let byteLen = 0;
        if (tag > 0xa0 && tag < 0xbf) {
            byteLen = tag - 0xa0;
        } else {
            switch (tag) {
                case 0xd9:
                byteLen = this.readUint8(buffer, tagOffset);
                tagOffset += 1;
                break;
                case 0xda:
                byteLen = this.readUint16(buffer, tagOffset);
                tagOffset += 2;
                break;
                case 0xdb:
                byteLen = this.readUint32(buffer, tagOffset);
                tagOffset += 4;
                break;
                default: throw `string handler not tag::${tag}`;
            }
        }
        let index = tagOffset | 0;
        const end = tagOffset + byteLen;
        let chr = 0;
        let string = '';
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
    /** 通过字符串占用的数据大小判断存储tag */
    strByteLen2buf(byteLen: number) {
        if (byteLen < 32) {
            return new Uint8Array([0xa0 + byteLen]);
        }
        if (byteLen <= 0xFF) {
            return this.writeUint8(0xd9, byteLen);
        }
        if (byteLen <= 0xFFFF) {
            return this.writeUint16(0xda, byteLen);
        }
        return this.writeUint32(0xdb, byteLen);
    }
}
