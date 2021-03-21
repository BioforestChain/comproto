import { dataTypeEnum, SerializationTag } from "../const";
import type { Comproto } from "../Comproto";
export default class UndefinedParseHandler implements BFChainComproto.TypeTransferHandler<undefined> {
  private TAG = new Uint8Array([SerializationTag.kUndefined]);
  constructor(comproto: Comproto) {
    comproto.setTypeHandler(this);
    comproto.setTagType(SerializationTag.kUndefined, dataTypeEnum.Undefined);
  }
  typeName = dataTypeEnum.Undefined;
  serialize() {
    return this.TAG;
  }
  deserialize(decoderState: BFChainComproto.decoderState) {
    decoderState.offset++;
    return undefined;
  }
}
