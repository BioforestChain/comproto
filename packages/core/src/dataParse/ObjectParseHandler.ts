import { dataTypeEnum } from "../const";
import type { Comproto } from "../Comproto";
import helper from "./bytesHelper";
/**
 * 0x80
 */
export default class ObjectParseHandler implements BFChainComproto.TypeTransferHandler<Object> {
  constructor(comproto: Comproto) {
    comproto.setTypeHandler(this);
    for (let i = 0x80; i <= 0x8f; i++) {
      comproto.setTagType(i, dataTypeEnum.Object);
    }
  }
  typeName = dataTypeEnum.Object;

  serialize(data: Object, resRef: BFChainComproto.U8AList, comproto: Comproto) {
    const oData = data as { [key: string]: unknown };
    const lenBytes = [0x80];
    resRef.push(lenBytes);
    let len = 0;
    for (const key in oData) {
      ++len;
      comproto.serializeTransfer(key, resRef);
      comproto.serializeTransfer(oData[key], resRef);
    }

    /// length2Buf
    // 0~14 这14中可能直接使用tag
    if (len <= 14) {
      lenBytes[0] |= len;
    } else {
      lenBytes[0] = 0x8f;
      helper.len2Buf(len, lenBytes, 1);
    }
  }
  deserialize(decoderState: BFChainComproto.decoderState, comproto: Comproto) {
    const tag = decoderState.buffer[decoderState.offset++];
    /// getLength
    let keysCount = tag ^ 0x80;
    if (keysCount === 15) {
      keysCount = helper.getLen(decoderState);
    }

    const data: { [key: string]: unknown } = {};
    for (let i = 0; i < keysCount; i++) {
      const key = comproto.deserializeTransfer(decoderState) as string;
      const value = comproto.deserializeTransfer(decoderState);
      data[key] = value;
    }
    return data;
  }
}
