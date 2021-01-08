import { dataTypeEnum } from '../const';

export default {
    typeName: dataTypeEnum.String,
    typeClass: String,
    serialize(data, comproto) {
        return new Uint8Array();
    },
    deserialize(buf) {
        return '';
    },
} as BFChainComproto.typeTransferHandler<typeof String>;
