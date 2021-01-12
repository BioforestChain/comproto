
import { dataTypeEnum, SerializationTag } from '../const';
import type { Comproto } from '../Comproto';

export default class BooleanParseHandler implements BFChainComproto.typeTransferHandler<boolean> {
    constructor(comproto: Comproto) {
        comproto.setTypeHandler(this);
        comproto.setTagType(SerializationTag.kTrue, dataTypeEnum.Boolean);
        comproto.setTagType(SerializationTag.kFalse, dataTypeEnum.Boolean);
    }
    typeName = dataTypeEnum.Boolean;
    serialize(data: boolean, comproto: Comproto) {
        const tag = data ? SerializationTag.kTrue : SerializationTag.kFalse;
        return new Uint8Array([tag]);
    }
    deserialize(decoderState: BFChainComproto.decoderState) {
        const tag = decoderState.buffer[decoderState.offset++];
        return tag === SerializationTag.kTrue;
    }
}
