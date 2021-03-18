import { dataTypeEnum } from "../const";
import type { Comproto } from "../Comproto";
import BaseParseHandler from "./BaseParseHandler";
import { u8aConcat } from "@bfchain/comproto-helps";

export default class ArrayBufferParseHandler
  extends BaseParseHandler
  implements BFChainComproto.typeTransferHandler<ArrayBuffer> {
  constructor(comproto: Comproto) {
    super();
    comproto.setTypeHandler(this);
    comproto.setTagType(0xd5, dataTypeEnum.ArrayBuffer);
    comproto.setTagType(0xd6, dataTypeEnum.ArrayBuffer);
    comproto.setTagType(0xd7, dataTypeEnum.ArrayBuffer);
  }
  typeName = dataTypeEnum.ArrayBuffer;
  serialize(data: ArrayBuffer) {
    const byteLen = data.byteLength;
    const headBuf = this.len2Buf(byteLen);
    return u8aConcat([headBuf, new Uint8Array(data)]);
  }
  deserialize(decoderState: BFChainComproto.decoderState) {
    const len = this.getLength(decoderState);
    const buf = decoderState.buffer.buffer.slice(decoderState.offset, decoderState.offset + len);
    decoderState.offset += len;
    return buf;
  }
  len2Buf(len: number) {
    if (len < 0xff) {
      return this.writeUint8(0xd5, len);
    } else if (len <= 0xffff) {
      return this.writeUint16(0xd6, len);
    } else {
      return this.writeUint32(0xd7, len);
    }
  }
  getLength(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset++];
    switch (tag) {
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
    throw `can not handler tag::${tag}`;
  }
}
