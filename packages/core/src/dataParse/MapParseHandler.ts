import { dataTypeEnum } from "../const";
import type { Comproto } from "../Comproto";
import BaseParseHandler from "./BaseParseHandler";
import { u8aConcat } from "@bfchain/comproto-helps";
export default class MapParseHandler
  extends BaseParseHandler
  implements BFChainComproto.typeTransferHandler<Map<unknown, unknown>> {
  constructor(comproto: Comproto) {
    super();
    comproto.setTypeHandler(this);
    comproto.setTagType(0xc8, dataTypeEnum.Map);
    comproto.setTagType(0xc9, dataTypeEnum.Map);
    comproto.setTagType(0xca, dataTypeEnum.Map);
  }
  typeName = dataTypeEnum.Map;
  typeClass = Map;
  serialize(dataMap: Map<unknown, unknown>, comproto: Comproto) {
    const dataKeyLen = dataMap.size;
    const headU8a = this.len2Buf(dataKeyLen);
    const dataBuf = [headU8a];
    let totalSize = headU8a.length;
    dataMap.forEach((value, key) => {
      const keyBuf = comproto.serializeTransfer(key);
      const valBuf = comproto.serializeTransfer(value);
      dataBuf.push(keyBuf, valBuf);
      totalSize += keyBuf.length;
      totalSize += valBuf.length;
    });
    return u8aConcat(dataBuf, totalSize);
  }
  deserialize(decoderState: BFChainComproto.decoderState, comproto: Comproto) {
    const keyLength = this.getLength(decoderState);
    const data = new Map();
    for (let i = 0; i < keyLength; i++) {
      const key = comproto.deserializeTransfer(decoderState);
      const value = comproto.deserializeTransfer(decoderState);
      data.set(key, value);
    }
    return data;
  }
  getLength(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset++];
    switch (tag) {
      case 0xc8:
        return this.readUint8(decoderState);
        break;
      case 0xc9:
        return this.readUint16(decoderState);
        break;
      case 0xca:
        return this.readUint32(decoderState);
        break;
    }
    throw `can not handler tag::${tag}`;
  }
  len2Buf(len: number) {
    if (len < 0xff) {
      return this.writeUint8(0xc8, len);
    } else if (len <= 0xffff) {
      return this.writeUint16(0xc9, len);
    } else {
      return this.writeUint32(0xca, len);
    }
  }
}
