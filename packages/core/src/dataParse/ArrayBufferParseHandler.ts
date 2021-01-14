
import { dataTypeEnum } from '../const';
import type { Comproto } from '../Comproto';
import BaseParseHandler from './BaseParseHandler';


export default class ArrayBufferParseHandler
extends BaseParseHandler
implements BFChainComproto.typeTransferHandler<ArrayBuffer> {
    constructor(comproto: Comproto) {
        super();
        comproto.setTypeHandler(this);
        comproto.setTagType(0xd5, dataTypeEnum.BufferView);
        comproto.setTagType(0xd6, dataTypeEnum.BufferView);
        comproto.setTagType(0xd7, dataTypeEnum.BufferView);
    }
    typeName = dataTypeEnum.BufferView;
    serialize(data: ArrayBuffer) {
        const byteLen = data.byteLength;
        const headBuf = this.len2Buf(byteLen);
        return new Uint8Array([...headBuf, ...new Uint8Array(data)]);
    }
    deserialize(decoderState: BFChainComproto.decoderState) {
        const len = this.getLength(decoderState);
        decoderState.offset += len;
        const buf = decoderState.buffer.buffer.slice(decoderState.offset, decoderState.offset + len);
        return buf;
    }
    len2Buf(len: number) {
        if (len < 0xFF) {
            return this.writeUint8(0xd5, len);
        } else if (len <= 0xFFFF) {
            return this.writeUint16(0xd6, len);
        } else {
            return this.writeUint32(0xd7, len);
        }
    }
    getLength(decoderState: BFChainComproto.decoderState) {
        const tag = decoderState.buffer[decoderState.offset++];
        switch(tag) {
            case 0xd5:
                return this.readUint8(decoderState);
            break;
            case 0xd6:
                return this.readUint16(decoderState);
            break;
            case 0xd7:
                return this.readUint32(decoderState);
            break;
        }
        throw `can not handler tag::${tag}`
    }
}
