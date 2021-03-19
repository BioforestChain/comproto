import { dataTypeEnum } from "../const";
import type { Comproto } from "../Comproto";
import helper from "./bytesHelper";
import { u8aConcat } from "@bfchain/comproto-helps";
/**
 * fixarray -- 0x90 - 0x9f
 * array 16 -- 0xdc
 * array 32 -- 0xdd
 */
export default class ArrayParseHandler implements BFChainComproto.typeTransferHandler<unknown[]> {
  constructor(comproto: Comproto) {
    comproto.setTypeHandler(this);
    // fixarray -- 0x90 - 0x9f
    for (let i = 0x90; i <= 0x9f; i++) {
      comproto.setTagType(i, dataTypeEnum.Array);
    }
    comproto.setTagType(0xdc, dataTypeEnum.Array);
    comproto.setTagType(0xdd, dataTypeEnum.Array);
  }
  typeName = dataTypeEnum.Array;
  typeClass = Array;
  serialize(dataArray: unknown[], resRef: BFChainComproto.U8AList, comproto: Comproto) {
    const dataLen = dataArray.length;
    const headU8a = this.length2Buf(dataLen);
    resRef.push(headU8a);
    for (const value of dataArray) {
      comproto.serializeTransfer(value, resRef);
    }
  }
  deserialize(decoderState: BFChainComproto.decoderState, comproto: Comproto) {
    const keyLength = this.getLength(decoderState);
    const dataArray: unknown[] = [];
    for (let i = 0; i < keyLength; i++) {
      const data = comproto.deserializeTransfer(decoderState);
      dataArray.push(data);
    }
    return dataArray;
  }
  private getLength(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset++];
    if (tag >= 0x90 && tag <= 0x9f) {
      return tag - 0x90;
    }
    switch (tag) {
      case 0xdc:
        return helper.readUint16(decoderState);
      case 0xdd:
        return helper.readUint32(decoderState);
    }
    throw `can not handler tag::${tag}`;
  }
  private length2Buf(len: number) {
    if (len < 16) {
      // 0x90 + len
      const tag = len + 0x90;
      return new Uint8Array([tag]);
    } else if (len <= 0xffff) {
      // 0xdc
      return helper.writeUint16(0xdc, len);
    } else {
      // 0xdd
      return helper.writeUint32(0xdd, len);
    }
  }
}
