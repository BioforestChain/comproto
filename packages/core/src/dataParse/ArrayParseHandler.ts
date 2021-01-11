
import { dataTypeEnum } from '../const';
import type { Comproto } from '../Comproto';
export default class ArrayParseHandler implements BFChainComproto.typeTransferHandler<typeof Array> {
    constructor(comproto: Comproto) {
        comproto.setTypeHandler(this);
    }
    typeName = dataTypeEnum.Array
    typeClass = Array
    serialize(dataArray: unknown[], comproto: Comproto) {
        //   const valueArray = [...value];
        // return valueArray.map((obj) => {
        //     return this.serializeTransfer(obj, transferState);
        // });
        return new Uint8Array();
    }
    deserialize(buf: Uint8Array) {
        return [];
    }
}
