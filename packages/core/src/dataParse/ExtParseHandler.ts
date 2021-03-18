import { dataTypeEnum, SerializationTag } from "../const";
import type { Comproto } from "../Comproto";
import BaseParseHandler from "./BaseParseHandler";
import { str2U8a, u8a2Str } from "@bfchain/comproto-helps";
/**
 * ext  -- 0xc7
 */
export default class ExtParseHandler
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
    if (!handler) throw new ReferenceError(`handler not exist`);
    const handlerNameU8a = str2U8a(handler.handlerName);
    let serializeData = undefined;
    if (handler.serialize) {
      serializeData = handler.serialize(data);
    }
    const dataBuf = comproto.serializeTransfer(serializeData);
    const handlerNameBuf = this.len2Buf(handlerNameU8a.byteLength);
    return new Uint8Array([0xc7, ...dataBuf, ...handlerNameBuf, ...handlerNameU8a]);
  }
  deserialize(decoderState: BFChainComproto.decoderState, comproto: Comproto) {
    // const byteLen = this.getLen(decoderState);
    decoderState.offset++;
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
  /** 通过字符串占用的数据大小判断存储tag */
  strByteLen2buf(byteLen: number) {
    if (byteLen < 32) {
      return new Uint8Array([0xa0 + byteLen]);
    }
    if (byteLen <= 0xff) {
      return this.writeUint8(0xd9, byteLen);
    }
    if (byteLen <= 0xffff) {
      return this.writeUint16(0xda, byteLen);
    }
    return this.writeUint32(0xdb, byteLen);
  }
}
