import { dataTypeEnum, SerializationTag } from "../const";
import type { Comproto } from "../Comproto";
import helper from "./bytesHelper";
import { str2U8a, u8a2Str, u8aConcat } from "@bfchain/comproto-helps";
/**
 * ext  -- 0xc7
 */
export default class ExtParseHandler implements BFChainComproto.TypeTransferHandler<unknown> {
  constructor(comproto: Comproto) {
    comproto.setTypeHandler(this);
    comproto.setTagType(0xc7, dataTypeEnum.Ext);
  }
  typeName = dataTypeEnum.Ext;

  serialize(data: unknown, resRef: BFChainComproto.U8AList, comproto: Comproto) {
    const handler = comproto.getHandler(data);
    if (!handler) throw new ReferenceError(`handler not exist`);
    let serializeData: unknown = undefined;
    if (handler.serialize) {
      serializeData = handler.serialize(data);
    }
    // 写入前缀与handleName
    resRef.push([0xc7], helper.dict2Buf(handler.handlerName));
    // 写入自定义序列化出纳的值
    comproto.serializeTransfer(serializeData, resRef);
  }
  deserialize(decoderState: BFChainComproto.decoderState, comproto: Comproto) {
    decoderState.offset++;
    // 读取handleName
    const handlerName = helper.readDict(decoderState);
    // 去读handle对应的值
    const data = comproto.deserializeTransfer(decoderState);

    /// 开始自定义解析
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
      return helper.writeUint8(0xd9, byteLen);
    }
    if (byteLen <= 0xffff) {
      return helper.writeUint16(0xda, byteLen);
    }
    return helper.writeUint32(0xdb, byteLen);
  }
}
