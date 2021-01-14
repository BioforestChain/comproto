
import { dataTypeEnum } from '../const';
import type { Comproto } from '../Comproto';
import BaseParseHandler from './BaseParseHandler'
export default class BigIntParseHandler
extends BaseParseHandler
implements BFChainComproto.typeTransferHandler<BigInt> {
    constructor(comproto: Comproto) {
        super();
        comproto.setTypeHandler(this);
        comproto.setTagType(0xd4, dataTypeEnum.BigInt);
    }
    typeName = dataTypeEnum.BigInt
    serialize(data: BigInt, comproto: Comproto) {
        const dataStr = String(data);
        const len = dataStr.length;
        const dataCodeArr: number[] = [];
        for(let i = 0; i <= dataStr.length - 1; i++) {
            dataCodeArr.push(dataStr.charCodeAt(i));
        }
        return new Uint8Array([0xd4, ...this.len2buf(len), ...dataCodeArr]);
    }
    deserialize(decoderState: BFChainComproto.decoderState) {
        const tag = decoderState.buffer[decoderState.offset ++];
        const len = this.getLen(decoderState);
        let str = '';
        for(let i = 0; i < len; i ++) {
            str += String.fromCharCode(decoderState.buffer[decoderState.offset ++]);
        }
        return BigInt(str);
    }
    len2buf(byteLen: number) {
        if (byteLen < 32) {
            return new Uint8Array([0xa0 + byteLen]);
        }
        if (byteLen <= 0xFF) {
            return this.writeUint8(0xd9, byteLen);
        }
        if (byteLen <= 0xFFFF) {
            return this.writeUint16(0xda, byteLen);
        }
        return this.writeUint32(0xdb, byteLen);
    }
    getLen(decoderState: BFChainComproto.decoderState) {
        const tag = decoderState.buffer[decoderState.offset ++];
        if (tag > 0xa0 && tag < 0xbf) {
            return tag - 0xa0;
        }
        switch (tag) {
            case 0xd9:
                return this.readUint8(decoderState);
            break;
            case 0xda:
                return this.readUint16(decoderState);
            break;
            case 0xdb:
                return this.readUint32(decoderState);
            break;
        }
        throw `string handler not tag::${tag}`;
    }
}

