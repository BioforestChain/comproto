import { dataTypeEnum, SerializationTag } from '../const';
import type { Comproto } from '../Comproto';
export default class UndefinedParseHandler implements BFChainComproto.typeTransferHandler<undefined> {
    constructor(comproto: Comproto) {
        comproto.setTypeHandler(this);
        comproto.setTagType(SerializationTag.kUndefined, dataTypeEnum.Undefined);
    }
    typeName = dataTypeEnum.Undefined;
    typeClass = undefined;
    serialize() {
        return new Uint8Array([SerializationTag.kUndefined]);
    }
    deserialize(decoderState: BFChainComproto.decoderState) {
        decoderState.offset ++;
        return undefined;
    }
}
