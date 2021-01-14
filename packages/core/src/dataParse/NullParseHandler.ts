import { dataTypeEnum, SerializationTag } from '../const';
import type { Comproto } from '../Comproto';
export default class NullParseHandler implements BFChainComproto.typeTransferHandler<null> {
    constructor(comproto: Comproto) {
        comproto.setTypeHandler(this);
        comproto.setTagType(SerializationTag.kNull, dataTypeEnum.Null);
    }
    typeName = dataTypeEnum.Null;
    typeClass = null;
    serialize() {
        return new Uint8Array([SerializationTag.kNull]);
    }
    deserialize(decoderState: BFChainComproto.decoderState) {
        decoderState.offset ++;
        return null;
    }
}
