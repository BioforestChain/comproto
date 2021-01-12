
import { dataTypeEnum, SerializationTag } from '../const';
import type { Comproto } from '../Comproto';
import BaseParseHandler from './BaseParseHandler';
import { str2U8a, u8a2Str } from '@bfchain/comproto-helps';
/**
 * ext  -- 0xc7
 */
export default class BooleanParseHandler
extends BaseParseHandler
implements BFChainComproto.typeTransferHandler<unknown> {
    constructor(comproto: Comproto) {
        super();
        comproto.setTypeHandler(this);
        comproto.setTagType(0xc7, dataTypeEnum.Ext);
    }
    typeName = dataTypeEnum.Ext;
    serialize(data: unknown, comproto: Comproto) {
        const handler = comproto.getHandler(data);
        if (!handler) throw `handler not exist`;
        const handlerNameU8a = str2U8a(handler.handlerName);
        let serializeData = undefined;
        if (handler.serialize) {
            serializeData = handler.serialize(data);
        }
        const dataBuf = comproto.serializeTransferType(serializeData);
        const handlerNameBuf = this.len2Buf(handlerNameU8a.byteLength);
        return new Uint8Array([0xc7, ...dataBuf, ...handlerNameBuf,...handlerNameU8a,]);
    }
    deserialize(decoderState: BFChainComproto.decoderState, comproto: Comproto) {
        // const byteLen = this.getLen(decoderState);
        decoderState.offset ++;
        const data = comproto.deserializeTransfer(decoderState);
        const handlerNameLen = this.getLen(decoderState);
        const handlerName = u8a2Str(decoderState.buffer, decoderState.offset, handlerNameLen);
        decoderState.offset += handlerNameLen;
        const handler = comproto.getHandlerByhandlerName(handlerName);
        if (handler && handler.deserialize) {
            return handler.deserialize(data);
        }
        return data;
    }
    len2Buf(length: number) {
        if (length < 0xFF) {
            return this.writeUint8(0xc7, length);
        }
        if (length <= 0xFFFF) {
            return this.writeUint16(0xc8, length);
        }
        return this.writeFloat32(0xc9, length);
    }
    getLen(decoderState: BFChainComproto.decoderState) {
        const tag = decoderState.buffer[decoderState.offset ++];
        switch (tag) {
            case 0xc7:
                return this.readUint8(decoderState);
            break;
            case 0xc8:
                return this.readUint16(decoderState);
            break;
            case 0xc9:
                return this.readUint32(decoderState);
            break;
        }
        throw `string handler not tag::${tag}`;
    }
    /** 通过字符串占用的数据大小判断存储tag */
    strByteLen2buf(byteLen: number) {
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
}
