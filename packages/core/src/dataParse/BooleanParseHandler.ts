
import { dataTypeEnum, SerializationTag } from '../const';
import type { Comproto } from '../Comproto';

export default class BooleanParseHandler implements BFChainComproto.typeTransferHandler<typeof Boolean> {
    constructor(comproto: Comproto) {
        comproto.setTypeHandler(this);
        comproto.setTagType(SerializationTag.kTrue, dataTypeEnum.Boolean);
        comproto.setTagType(SerializationTag.kFalse, dataTypeEnum.Boolean);
    }
    typeName = dataTypeEnum.Boolean;
    typeClass = Boolean;
    serialize(data: Boolean, comproto: Comproto) {
        const tag = data ? SerializationTag.kTrue : SerializationTag.kFalse;
        return new Uint8Array([tag]);
    }
    deserialize(buf: Uint8Array, tagOffset: number) {
        const tag = buf[tagOffset];
        return tag === SerializationTag.kTrue;
    }
}
