import { dataTypeEnum } from "../const";
import type { Comproto } from "../Comproto";
import helper from "./BaseParseHandler";
import { u8aConcat } from "@bfchain/comproto-helps";
/**
 * fixmap -- 0x80 - 0x8f
 * map 16 -- 0xde
 * map 32 -- 0xdf
 */
export default class ObjectParseHandler implements BFChainComproto.typeTransferHandler<Object> {
  constructor(comproto: Comproto) {
    comproto.setTypeHandler(this);
    // fixmap -- 0x80 - 0x8f
    for (let i = 0x80; i <= 0x8f; i++) {
      comproto.setTagType(i, dataTypeEnum.Object);
    }
    comproto.setTagType(0xde, dataTypeEnum.Object);
    comproto.setTagType(0xdf, dataTypeEnum.Object);
  }
  typeName = dataTypeEnum.Object;
  serialize(data: Object, resRef: BFChainComproto.U8AList, comproto: Comproto) {
    const oData = data as { [key: string]: unknown };
    const dataMap = Object.keys(oData);
    const dataKeyLen = dataMap.length;
    const headU8a = this.length2Buf(dataKeyLen);
    resRef.push(headU8a);
    // const dataBuf = [headU8a];
    // let totalSize = headU8a.length;
    dataMap.forEach((key) => {
      comproto.serializeTransfer(key, resRef);
      comproto.serializeTransfer(oData[key], resRef);
      // dataBuf.push(keyBuf, valBuf);
      // totalSize += keyBuf.length;
      // totalSize += valBuf.length;
    });
    // return u8aConcat(dataBuf, totalSize);
  }
  deserialize(decoderState: BFChainComproto.decoderState, comproto: Comproto) {
    const keyLength = this.getLength(decoderState);
    const data: { [key: string]: unknown } = {};
    for (let i = 0; i < keyLength; i++) {
      const key = comproto.deserializeTransfer(decoderState) as string;
      const value = comproto.deserializeTransfer(decoderState);
      data[key] = value;
    }
    return data;
  }
  private getLength(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset++];
    if (tag >= 0x80 && tag <= 0x8f) {
      return tag - 0x80;
    }
    switch (tag) {
      case 0xde:
        return helper.readUint16(decoderState);
        break;
      case 0xdf:
        return helper.readUint32(decoderState);
        break;
    }
    throw `can not handler tag::${tag}`;
  }
  private length2Buf(len: number) {
    if (len < 16) {
      // 0x80
      const tag = len + 0x80;
      return new Uint8Array([tag]);
    } else if (len <= 0xffff) {
      // 0xde
      return helper.writeUint16(0xde, len);
    } else {
      // 0xdf
      return helper.writeUint32(0xdf, len);
    }
  }
}
