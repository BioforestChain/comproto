
import { dataTypeEnum } from '../const';
import type { Comproto } from '../Comproto';
export default class BigIntParseHandler implements BFChainComproto.typeTransferHandler<BigInt> {
    constructor(comproto: Comproto) {
        comproto.setTypeHandler(this);
    }
    typeName = dataTypeEnum.BigInt
    serialize(data: BigInt, comproto: Comproto) {
        return new Uint8Array();
    }
    deserialize(decoderState: BFChainComproto.decoderState) {
        return 1n;
    }
}

