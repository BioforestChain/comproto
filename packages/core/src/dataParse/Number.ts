import { dataTypeEnum } from '../const';

export default {
    typeName: dataTypeEnum.Number,
    typeClass: Number,
    serialize(data, comproto) {
        return new Uint8Array();
    },
    deserialize(buf) {
        return 1;
    },
} as BFChainComproto.typeTransferHandler<typeof Number>;
