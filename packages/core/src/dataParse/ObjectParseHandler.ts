import { dataTypeEnum } from '../const';
import type { Comproto } from '../Comproto';
export default class ObjectParseHandler implements BFChainComproto.typeTransferHandler<typeof Object> {
    constructor(comproto: Comproto) {
        comproto.setTypeHandler(this);
    }
    typeName = dataTypeEnum.Object;
    typeClass = Object;
    serialize(data: Object, comproto: Comproto) {
        return new Uint8Array();
    }
    deserialize(buf: Uint8Array) {
        return {};
    }
}

