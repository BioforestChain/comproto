import { dataTypeEnum } from "../const";
import type { Comproto } from "../Comproto";
import helper from "./bytesHelper";
import { u8aConcat } from "@bfchain/comproto-helps";

export default class ArrayBufferParseHandler
  implements BFChainComproto.TypeTransferHandler<ArrayBuffer> {
  constructor(comproto: Comproto) {
    comproto.setTypeHandler(this);
    comproto.setTagType(0xd5, dataTypeEnum.ArrayBuffer);
    comproto.setTagType(0xd6, dataTypeEnum.ArrayBuffer);
    comproto.setTagType(0xd7, dataTypeEnum.ArrayBuffer);
  }
  typeName = dataTypeEnum.ArrayBuffer;
  serialize(data: ArrayBuffer, resRef: BFChainComproto.U8AList) {
    const byteLen = data.byteLength;
    const headBuf = this.length2Buf(byteLen);
    resRef.push(headBuf, new Uint8Array(data));
  }
  deserialize(decoderState: BFChainComproto.decoderState) {
    const len = this.getLength(decoderState);
    const buf = decoderState.buffer.buffer.slice(decoderState.offset, decoderState.offset + len);
    decoderState.offset += len;
    return buf;
  }
  private length2Buf(len: number) {
    if (len < 0xff) {
      return helper.writeUint8(0xd5, len);
    } else if (len <= 0xffff) {
      return helper.writeUint16(0xd6, len);
    } else {
      return helper.writeUint32(0xd7, len);
    }
  }
  private getLength(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset++];
    switch (tag) {
      case 0xd5:
        return helper.readUint8(decoderState);
      case 0xd6:
        return helper.readUint16(decoderState);
      case 0xd7:
        return helper.readUint32(decoderState);
    }
    throw `can not handler tag::${tag}`;
  }
}
