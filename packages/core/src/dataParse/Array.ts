
import { dataTypeEnum } from '../const';
export default {
    typeName: dataTypeEnum.Array,
    typeClass: Array,
    serialize(dataArray, comproto) {
        //   const valueArray = [...value];
        // return valueArray.map((obj) => {
        //     return this.serializeTransfer(obj, transferState);
        // });
        return new Uint8Array();
    },
    deserialize(buf) {
        return [];
    },
} as BFChainComproto.typeTransferHandler<typeof Array>;

