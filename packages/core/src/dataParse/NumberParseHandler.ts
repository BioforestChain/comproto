import { dataTypeEnum } from "../const";
import type { Comproto } from "../Comproto";
import helper from "./bytesHelper";
import { bytesHelper } from ".";
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
    // float 64
    comproto.setTagType(0xcb, dataTypeEnum.Number);
    // positive varint
    comproto.setTagType(0xcc, dataTypeEnum.Number);
    // negative varint
    comproto.setTagType(0xcd, dataTypeEnum.Number);
  }
  typeName = dataTypeEnum.Number;
  private _arrCache: Array<Int8Array> = [];
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
      return this._arrCache[ivalue] || (this._arrCache[ivalue] = new Int8Array([ivalue & 0xff]));
    }
    // 大于0
    if (ivalue >= 0) {
      return helper.writeVarInt(ivalue, [0xcc], 1);
    } else {
      return helper.writeVarInt(-ivalue, [0xcd], 1);
    }
  }
  private _numCache: { [tag: number]: number } = Object.create(null);
  deserialize(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset++];
    switch (tag) {
      case 0xcb:
        return helper.readFloat64(decoderState);
      case 0xcc:
        return helper.readVarInt(decoderState);
      case 0xcd:
        return -helper.readVarInt(decoderState);
      default:
        return this._numCache[tag] || (this._numCache[tag] = tag >= 0xe0 ? tag - 256 : tag);
    }
  }
}

// const TIMES = 1e7;
// {
//   let res: any;
//   console.time("create varint8");
//   for (let i = 0; i < TIMES; i++) {
//     res = bytesHelper.writeVarInt(1, [], 0);
//   }
//   console.timeEnd("create varint8");
//   console.log(res);
// }
// {
//   let res: any;
//   console.time("create uint8");
//   for (let i = 0; i < TIMES; i++) {
//     res = bytesHelper.writeUint8(0, 1);
//   }
//   console.timeEnd("create uint8");
//   console.log(res);
// }
// {
//   let res: any;
//   console.time("create varint16");
//   for (let i = 0; i < TIMES; i++) {
//     res = bytesHelper.writeVarInt(65535, [], 0);
//   }
//   console.timeEnd("create varint16");
//   console.log(res);
// }
// {
//   let res: any;
//   console.time("create uint16");
//   for (let i = 0; i < TIMES; i++) {
//     res = bytesHelper.writeInt16(0, 65535);
//   }
//   console.timeEnd("create uint16");
//   console.log(res);
// }
// {
//   let res: any;
//   console.time("create varint32");
//   for (let i = 0; i < TIMES; i++) {
//     res = bytesHelper.writeVarInt(1294967295, [], 0);
//   }
//   console.timeEnd("create varint32");
//   console.log(res);
// }
// {
//   let res: any;
//   console.time("create uint32");
//   for (let i = 0; i < TIMES; i++) {
//     res = bytesHelper.writeInt16(0, 4294967295);
//   }
//   console.timeEnd("create uint32");
//   console.log(res);
// }
// {
//   let res: any;
//   console.time("create array");
//   for (let i = 0; i < TIMES; i++) {
//     res = [1];
//   }
//   console.timeEnd("create array");
//   console.log(res);
// }
// {
//   console.time("create buffer");
//   const cache: any = []; //Object.create(null);
//   let res: any;
//   console.time("create array");
//   for (let i = 0; i < TIMES; i++) {
//     res = cache[1] || (cache[1] = new Uint8Array([1]));
//   }
//   console.timeEnd("create buffer");
//   console.log(res);
// }
