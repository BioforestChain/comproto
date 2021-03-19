import { dataTypeEnum } from "../const";
import type { Comproto } from "../Comproto";
import helper from "./bytesHelper";

export default class MapParseHandler
  implements BFChainComproto.typeTransferHandler<Map<unknown, unknown>> {
  constructor(comproto: Comproto) {
    comproto.setTypeHandler(this);
    comproto.setTagType(0xc8, dataTypeEnum.Map);
    comproto.setTagType(0xc9, dataTypeEnum.Map);
    comproto.setTagType(0xca, dataTypeEnum.Map);
  }
  typeName = dataTypeEnum.Map;
  typeClass = Map;
  serialize(dataMap: Map<unknown, unknown>, resRef: BFChainComproto.U8AList, comproto: Comproto) {
    const dataKeyLen = dataMap.size;
    const headU8a = this.length2Buf(dataKeyLen);
    resRef.push(headU8a);
    for (const item of dataMap) {
      comproto.serializeTransfer(item[0], resRef); // key
      comproto.serializeTransfer(item[1], resRef); // value
    }
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
  private getLength(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset++];
    switch (tag) {
      case 0xc8:
        return helper.readUint8(decoderState);
      case 0xc9:
        return helper.readUint16(decoderState);
      case 0xca:
        return helper.readUint32(decoderState);
    }
    throw `can not handler tag::${tag}`;
  }
  private length2Buf(len: number) {
    if (len < 0xff) {
      return helper.writeUint8(0xc8, len);
    } else if (len <= 0xffff) {
      return helper.writeUint16(0xc9, len);
    } else {
      return helper.writeUint32(0xca, len);
    }
  }
}
