import { dataTypeEnum, SerializationTag } from "../const";
import type { Comproto } from "../Comproto";

export default class BooleanParseHandler implements BFChainComproto.TypeTransferHandler<boolean> {
  constructor(comproto: Comproto) {
    comproto.setTypeHandler(this);
    comproto.setTagType(SerializationTag.kTrue, dataTypeEnum.Boolean);
    comproto.setTagType(SerializationTag.kFalse, dataTypeEnum.Boolean);
  }
  typeName = dataTypeEnum.Boolean;
  private TRUE_TAG = new Uint8Array([SerializationTag.kTrue]);
  private FALSE_TAG = new Uint8Array([SerializationTag.kFalse]);
  serialize(data: boolean, resRef: BFChainComproto.U8AList, comproto: Comproto) {
    return data ? this.TRUE_TAG : this.FALSE_TAG;
  }
  deserialize(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset++];
    return tag === SerializationTag.kTrue;
  }
}
