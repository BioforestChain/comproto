import { dataTypeEnum, SerializationTag } from "../const";
import type { Comproto } from "../Comproto";
import BaseParseHandler from "./BaseParseHandler";
import { str2U8a, u8a2Str } from "@bfchain/comproto-helps";
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
    for (let i = 0xa0; i <= 0xbf; i++) {
      comproto.setTagType(i, dataTypeEnum.String);
    }
    comproto.setTagType(0xd9, dataTypeEnum.String);
    comproto.setTagType(0xda, dataTypeEnum.String);
    comproto.setTagType(0xdb, dataTypeEnum.String);
  }
  typeName = dataTypeEnum.String;
  serialize(data: string) {
    const arrayBuf = str2U8a(data);
    const headLenArr = this.strByteLen2buf(arrayBuf.byteLength);
    return new Uint8Array([...headLenArr, ...arrayBuf]);
  }
  deserialize(decoderState: BFChainComproto.decoderState) {
    let byteLen = this.getLen(decoderState);
    let index = decoderState.offset | 0;
    decoderState.offset += byteLen;
    const end = decoderState.offset;
    let chr = 0;
    let string = "";
    const { buffer } = decoderState;
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
  }
  /** 通过字符串占用的数据大小判断存储tag */
  strByteLen2buf(byteLen: number) {
    if (byteLen < 32) {
      return new Uint8Array([0xa0 + byteLen]);
    }
    if (byteLen <= 0xff) {
      return this.writeUint8(0xd9, byteLen);
    }
    if (byteLen <= 0xffff) {
      return this.writeUint16(0xda, byteLen);
    }
    return this.writeUint32(0xdb, byteLen);
  }
  getLen(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset++];
    if (tag >= 0xa0 && tag <= 0xbf) {
      return tag - 0xa0;
    }
    switch (tag) {
      case 0xd9:
        return this.readUint8(decoderState);
        break;
      case 0xda:
        return this.readUint16(decoderState);
        break;
      case 0xdb:
        return this.readUint32(decoderState);
        break;
    }
    throw `string handler not tag::${tag}`;
  }
}
