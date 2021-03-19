import { dataTypeEnum } from "../const";
import type { Comproto } from "../Comproto";
import helper from "./BaseParseHandler";
import { str2U8a, u8a2Str } from "@bfchain/comproto-helps";
export default class StringParseHandler implements BFChainComproto.typeTransferHandler<string> {
  /**
   *  fixstr -- 0xa0 - 0xbf
   *  str 8 -- 0xd9
   *  str 16 -- 0xda
   *  str 32 -- 0xdb
   */
  constructor(comproto: Comproto) {
    comproto.setTypeHandler(this);
    for (let i = 0xa0; i <= 0xbf; i++) {
      comproto.setTagType(i, dataTypeEnum.String);
    }
    comproto.setTagType(0xd9, dataTypeEnum.String);
    comproto.setTagType(0xda, dataTypeEnum.String);
    comproto.setTagType(0xdb, dataTypeEnum.String);
  }
  typeName = dataTypeEnum.String;
  serialize(data: string, resRef: BFChainComproto.U8AList) {
    const arrayBuf = str2U8a(data);
    const headLenArr = this.strByteLen2buf(arrayBuf.byteLength);
    resRef.push(headLenArr, arrayBuf);
  }
  deserialize(decoderState: BFChainComproto.decoderState) {
    let byteLen = this.getLength(decoderState);
    let index = decoderState.offset | 0;
    const strU8a = decoderState.buffer.slice(index, index + byteLen);
    decoderState.offset += byteLen;
    return u8a2Str(strU8a);
  }
  /** 通过字符串占用的数据大小判断存储tag */
  private strByteLen2buf(byteLen: number) {
    if (byteLen < 32) {
      return new Uint8Array([0xa0 + byteLen]);
    }
    if (byteLen <= 0xff) {
      return helper.writeUint8(0xd9, byteLen);
    }
    if (byteLen <= 0xffff) {
      return helper.writeUint16(0xda, byteLen);
    }
    return helper.writeUint32(0xdb, byteLen);
  }
  private getLength(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset++];
    if (tag >= 0xa0 && tag <= 0xbf) {
      return tag - 0xa0;
    }
    switch (tag) {
      case 0xd9:
        return helper.readUint8(decoderState);
        break;
      case 0xda:
        return helper.readUint16(decoderState);
        break;
      case 0xdb:
        return helper.readUint32(decoderState);
        break;
    }
    throw `string handler not tag::${tag}`;
  }
}
