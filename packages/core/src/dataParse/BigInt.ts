import { dataTypeEnum } from '../const';

export default {
    typeName: dataTypeEnum.BigInt,
    typeClass: BigInt,
    serialize(numBn, comproto) {
        return new Uint8Array();
    },
    deserialize(buf) {
        return 1n;
    },
} as BFChainComproto.typeTransferHandler<typeof BigInt>;
