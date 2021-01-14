
import { dataTypeEnum } from '../const';
import type { Comproto } from '../Comproto';
import BaseParseHandler from './BaseParseHandler';


export default class BufferViewParseHandler
extends BaseParseHandler
implements BFChainComproto.typeTransferHandler<ArrayBufferView> {
    constructor(comproto: Comproto) {
        super();
        comproto.setTypeHandler(this);
        comproto.setTagType(0xc4, dataTypeEnum.BufferView);
        comproto.setTagType(0xc5, dataTypeEnum.BufferView);
        comproto.setTagType(0xc6, dataTypeEnum.BufferView);
    }
    typeName = dataTypeEnum.BufferView;
    serialize(data: ArrayBufferView) {
        const byteLen = data.byteLength;
        const headBuf = this.len2Buf(byteLen);
        return new Uint8Array([...headBuf, ...new Uint8Array(data.buffer)]);
    }
    deserialize(decoderState: BFChainComproto.decoderState) {
        const len = this.getLength(decoderState);
        decoderState.offset += len;
        const buf = decoderState.buffer.slice(decoderState.offset, decoderState.offset + len);
        return new Uint8Array(buf);
    }
    len2Buf(len: number) {
        if (len < 0xFF) {
            return this.writeUint8(0xc4, len);
        } else if (len <= 0xFFFF) {
            return this.writeUint16(0xc5, len);
        } else {
            return this.writeUint32(0xc6, len);
        }
    }
    getLength(decoderState: BFChainComproto.decoderState) {
        const tag = decoderState.buffer[decoderState.offset++];
        switch(tag) {
            case 0xc4:
                return this.readUint8(decoderState);
            break;
            case 0xc5:
                return this.readUint16(decoderState);
            break;
            case 0xc6:
                return this.readUint32(decoderState);
            break;
        }
        throw `can not handler tag::${tag}`
    }
}
