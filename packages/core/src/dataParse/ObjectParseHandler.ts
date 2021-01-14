import { dataTypeEnum } from '../const';
import type { Comproto } from '../Comproto';
import BaseParseHandler from './BaseParseHandler';
/**
 * fixmap -- 0x80 - 0x8f
 * map 16 -- 0xde
 * map 32 -- 0xdf
 */
export default class ObjectParseHandler
extends BaseParseHandler
implements BFChainComproto.typeTransferHandler<Object> {
    constructor(comproto: Comproto) {
        super();
        comproto.setTypeHandler(this);
        // fixmap -- 0x80 - 0x8f
        for (let i = 0x80; i <= 0x8f; i++) {
            comproto.setTagType(i, dataTypeEnum.Object);
        }
        comproto.setTagType(0xde, dataTypeEnum.Object);
        comproto.setTagType(0xdf, dataTypeEnum.Object);
    }
    typeName = dataTypeEnum.Object;
    serialize(data: Object, comproto: Comproto) {
        const oData = data as { [key: string]: unknown };
        const dataMap = Object.keys(oData);
        const dataKeyLen = dataMap.length;
        const headU8a = this.len2Buf(dataKeyLen);
        const dataBuf: number[] = [];
        dataMap.forEach((key) => {
            const keyBuf = comproto.serializeTransfer(key);
            const valBuf = comproto.serializeTransfer(oData[key]);
            dataBuf.push(...keyBuf, ...valBuf);
        });
        return new Uint8Array([...headU8a, ...dataBuf]);
    }
    deserialize(decoderState: BFChainComproto.decoderState, comproto: Comproto) {
        const keyLength = this.getLength(decoderState);
        const data: { [key: string]: unknown } = {};
        for(let i = 0; i < keyLength; i++) {
            const key = comproto.deserializeTransfer(decoderState) as string;
            const value = comproto.deserializeTransfer(decoderState);
            data[key] = value;
        }
        return data;
    }
    getLength(decoderState: BFChainComproto.decoderState) {
        const tag = decoderState.buffer[decoderState.offset++];
        if (tag >= 0x80 && tag <= 0x8f) {
            return tag - 0x80;
        }
        switch(tag) {
            case 0xde:
                return this.readUint16(decoderState);
            break;
            case 0xdf:
                return this.readUint32(decoderState);
            break;
        }
        throw `can not handler tag::${tag}`
    }
    len2Buf(len: number) {
        if (len < 16) {
            // 0x80
            const tag = len + 0x80;
            return new Uint8Array([tag]);
        } else if (len <= 0xFFFF) {
            // 0xde
            return this.writeUint16(0xde, len);
        } else {
            // 0xdf
            return this.writeUint32(0xde, len);
        }
    }
}

