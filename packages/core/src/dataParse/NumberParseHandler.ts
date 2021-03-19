import { dataTypeEnum } from "../const";
import type { Comproto } from "../Comproto";
import helper from "./bytesHelper";
/**
 * positive fixint -- 0x00 - 0x7f (0 ~ 127)
 * negative fixint -- 0xe0 - 0xff (-32 ~ -1)
 *
 *
 * float 64 -- 0xcb
 *
 * 小于0整数
 * int 8 -- 0xd0
 * int 16 -- 0xd1
 * int 32 -- 0xd2
 * int 64 -- 0xd3
 *
 * 大于0整数
 * uint 8 -- 0xcc
 * uint 16 -- 0xcd
 * uint 32 -- 0xce
 * uint 64 -- 0xcf
 */
export default class NumberParseHandler implements BFChainComproto.typeTransferHandler<number> {
  constructor(comproto: Comproto) {
    comproto.setTypeHandler(this);
    // positive fixint -- 0x00 - 0x7f
    for (let i = 0x00; i <= 0x7f; i++) {
      comproto.setTagType(i, dataTypeEnum.Number);
    }
    // negative fixint -- 0xe0 - 0xff
    for (let i = 0xe0; i <= 0xff; i++) {
      comproto.setTagType(i, dataTypeEnum.Number);
    }
    // uint 8 16 32 64
    comproto.setTagType(0xcc, dataTypeEnum.Number);
    comproto.setTagType(0xcd, dataTypeEnum.Number);
    comproto.setTagType(0xce, dataTypeEnum.Number);
    comproto.setTagType(0xcf, dataTypeEnum.Number);
    // int 8 16 32 64
    comproto.setTagType(0xd0, dataTypeEnum.Number);
    comproto.setTagType(0xd1, dataTypeEnum.Number);
    comproto.setTagType(0xd2, dataTypeEnum.Number);
    comproto.setTagType(0xd3, dataTypeEnum.Number);
    // float 64
    comproto.setTagType(0xcb, dataTypeEnum.Number);
  }
  typeName = dataTypeEnum.Number;
  serialize(value: number, resRef: BFChainComproto.U8AList, comproto: Comproto) {
    const ivalue = value | 0;
    if (value !== ivalue) {
      // float 64 -- 0xcb
      return helper.writeFloat64(0xcb, value);
    }
    // -32 ~ -1 用 224~255 保存
    // 0 ~ 127 用 0 ~ 127 保存
    if (-0x20 <= ivalue && ivalue <= 0x7f) {
      // positive fixint -- 0x00 - 0x7f
      // negative fixint -- 0xe0 - 0xff
      return [ivalue & 0xff];
    }
    // 大于0
    if (ivalue >= 0) {
      // uint 8 -- 0xcc
      // uint 16 -- 0xcd
      // uint 32 -- 0xce
      if (ivalue <= 0xff) {
        // 0xcc
        return helper.writeUint8(0xcc, ivalue);
      }
      if (ivalue <= 0xffff) {
        // 0xcd
        return helper.writeUint16(0xcd, ivalue);
      }
      // 0xce
      return helper.writeUint32(0xce, ivalue);
    }
    // int 8 -- 0xd0
    // int 16 -- 0xd1
    // int 32 -- 0xd2
    if (ivalue >= -0x80) {
      // 0xd0
      return helper.writeInt8(0xd0, ivalue);
    } else if (ivalue >= -0x8000) {
      // 0xd1
      return helper.writeInt16(0xd1, ivalue);
    } else {
      // 0xd2
      return helper.writeInt32(0xd2, ivalue);
    }
    // return new Uint8Array();
  }
  deserialize(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset++];
    // positive fixint -- 0x00 - 0x7f
    if (tag >= 0x00 && tag <= 0x7f) {
      return tag;
    }
    // negative fixint -- 0xe0 - 0xff
    if (tag >= 0xe0 && tag <= 0xff) {
      return tag - 0x100;
    }

    switch (tag) {
      // int8
      case 0xd0:
        return helper.readInt8(decoderState);
      // int16
      case 0xd1:
        return helper.readInt16(decoderState);
        break;
      // int32
      case 0xd2:
        return helper.readInt32(decoderState);
        break;
      // int64
      case 0xd3:
        return Number(helper.readInt64(decoderState));
        break;
      // uint8
      case 0xcc:
        return helper.readUint8(decoderState);
        break;
      // uint16
      case 0xcd:
        return helper.readUint16(decoderState);
        break;
      // uint32
      case 0xce:
        return helper.readUint32(decoderState);
        break;
      // uint64
      case 0xcf:
        return Number(helper.readUint64(decoderState));
        break;
      case 0xcb:
        return helper.readFloat64(decoderState);
        break;
    }
    throw `number handler can not handler tag::${tag}`;
  }
}
