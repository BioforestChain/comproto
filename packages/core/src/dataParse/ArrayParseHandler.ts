import { dataTypeEnum } from "../const";
import type { Comproto } from "../Comproto";
import BaseParseHandler from "./BaseParseHandler";
import { u8aConcat } from "@bfchain/comproto-helps";
/**
 * fixarray -- 0x90 - 0x9f
 * array 16 -- 0xdc
 * array 32 -- 0xdd
 */
export default class ArrayParseHandler
  extends BaseParseHandler
  implements BFChainComproto.typeTransferHandler<unknown[]> {
  constructor(comproto: Comproto) {
    super();
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
  serialize(dataArray: unknown[], comproto: Comproto) {
    const dataLen = dataArray.length;
    const headU8a = this.len2Buf(dataLen);
    const dataBuf = [headU8a];
    let totalSize = headU8a.byteLength;
    dataArray.forEach((value) => {
      const chunk = comproto.serializeTransfer(value);
      dataBuf.push(chunk);
      totalSize += chunk.byteLength;
    });
    return u8aConcat(dataBuf, totalSize);
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
  getLength(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset++];
    if (tag >= 0x90 && tag <= 0x9f) {
      return tag - 0x90;
    }
    switch (tag) {
      case 0xdc:
        return this.readUint16(decoderState);
        break;
      case 0xdd:
        return this.readUint32(decoderState);
        break;
    }
    throw `can not handler tag::${tag}`;
  }
  len2Buf(len: number) {
    if (len < 16) {
      // 0x90 + len
      const tag = len + 0x90;
      return new Uint8Array([tag]);
    } else if (len <= 0xffff) {
      // 0xdc
      return this.writeUint16(0xdc, len);
    } else {
      // 0xdd
      return this.writeUint32(0xdd, len);
    }
  }
}
