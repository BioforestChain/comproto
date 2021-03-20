import { dataTypeEnum, SerializationTag } from "../const";
import type { Comproto } from "../Comproto";
export default class NullParseHandler implements BFChainComproto.typeTransferHandler<null> {
  private TAG = new Uint8Array([SerializationTag.kNull]);
  constructor(comproto: Comproto) {
    comproto.setTypeHandler(this);
    comproto.setTagType(SerializationTag.kNull, dataTypeEnum.Null);
  }
  typeName = dataTypeEnum.Null;
  typeClass = null;
  serialize() {
    return this.TAG;
  }
  deserialize(decoderState: BFChainComproto.decoderState) {
    decoderState.offset++;
    return null;
  }
}
