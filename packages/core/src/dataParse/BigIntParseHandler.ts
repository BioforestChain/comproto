import { dataTypeEnum } from "../const";
import type { Comproto } from "../Comproto";
import BaseParseHandler from "./BaseParseHandler";
import { u8aConcat } from "@bfchain/comproto-helps";
export default class BigIntParseHandler
  extends BaseParseHandler
  implements BFChainComproto.typeTransferHandler<BigInt> {
  constructor(comproto: Comproto) {
    super();
    comproto.setTypeHandler(this);
    comproto.setTagType(0xd4, dataTypeEnum.BigInt);
  }
  typeName = dataTypeEnum.BigInt;
  serialize(data: BigInt, comproto: Comproto) {
    const dataStr = String(data);
    const len = dataStr.length;
    const dataCodeArr: number[] = [];
    for (let i = 0; i <= dataStr.length - 1; i++) {
      dataCodeArr.push(dataStr.charCodeAt(i));
    }
    return u8aConcat([[0xd4], this.len2Buf(len), dataCodeArr]);
  }
  deserialize(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset++];
    const len = this.getLen(decoderState);
    let str = "";
    for (let i = 0; i < len; i++) {
      str += String.fromCharCode(decoderState.buffer[decoderState.offset++]);
    }
    return BigInt(str);
  }
}
