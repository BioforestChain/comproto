import { dataTypeEnum } from "../const";
import type { Comproto } from "../Comproto";
import BaseParseHandler from "./BaseParseHandler";
import { u8aConcat, str2U8a, u8a2Str, hex2Binary, binary2Hex } from "@bfchain/comproto-helps";
export default class BigIntParseHandler
  extends BaseParseHandler
  implements BFChainComproto.typeTransferHandler<bigint> {
  constructor(comproto: Comproto) {
    super();
    comproto.setTypeHandler(this);
    comproto.setTagType(0xd4, dataTypeEnum.BigInt);
  }
  typeName = dataTypeEnum.BigInt;
  serialize(data: bigint, comproto: Comproto) {
    /// 是否有符号
    let sign = 0;
    if (data < 0n) {
      sign = 1;
      data = -data; ///转成正数
    }

    const dataBinary = hex2Binary(data.toString(16));
    const len = dataBinary.length;
    return u8aConcat([[0xd4, sign], this.len2Buf(len), dataBinary]);
  }
  deserialize(decoderState: BFChainComproto.decoderState) {
    ++decoderState.offset; // const tag = decoderState.buffer[decoderState.offset++];
    const sign = decoderState.buffer[decoderState.offset++] === 1;
    const len = this.getLen(decoderState);
    const hex = binary2Hex(decoderState.buffer, decoderState.offset, (decoderState.offset += len));
    if (sign) {
      return -BigInt("0x" + hex);
    }
    return BigInt("0x" + hex);
  }
}
// declare var Buffer: any;
// const z = 36893488147419228386n;
// const TIMES = 50000;
// // {
// //   console.time("js1");
// //   let res;
// //   for (let i = 0; i < TIMES; i++) {
// //     res = new Uint8Array(
// //       z
// //         .toString(16)
// //         .match(/../g)!
// //         .map((x) => "0x" + x) as any,
// //     );
// //   }
// //   console.timeEnd("js1");
// //   console.log(res);
// // }
// console.group("[TEST] bigint to u8a");
// {
//   {
//     const hex2numHasMap: { [hex: string]: number } = Object.create(null);
//     for (let i = 0; i < 256; i++) {
//       const str = i.toString(16);
//       hex2numHasMap[str] = i;
//       if (str.length === 1) {
//         hex2numHasMap["0" + str] = i;
//       }
//     }
//     Object.freeze(hex2numHasMap);
//     console.time("js2");
//     let res = new Uint8Array(
//       (z.toString(16).length + /**一定要是个偶数，可能会少一位，这里+1不会影响结果 */ 1) >> 1,
//     );
//     for (let i = 0; i < TIMES; i++) {
//       const hex = z.toString(16);
//       res = new Uint8Array(
//         (hex.length + /**一定要是个偶数，可能会少一位，这里+1不会影响结果 */ 1) >> 1,
//       );
//       const len2 = hex.length + 2;
//       for (let i = res.length - 1, start = -2; i >= 0; i--, start -= 2) {
//         res[i] = hex2numHasMap[hex.slice(start, len2 + start)];
//       }
//     }
//     console.timeEnd("js2");
//     console.log(BigInt("0x" + Buffer.from(res).toString("hex")) === z);
//   }

//   {
//     console.time("native1");
//     let res;
//     for (let i = 0; i < TIMES; i++) {
//       res = Buffer.from("0" + z.toString(16), "hex");
//     }
//     console.timeEnd("native1");
//     console.log(BigInt("0x" + Buffer.from(res).toString("hex")) === z);
//   }

//   {
//     console.time("native2");
//     let res;
//     for (let i = 0; i < TIMES; i++) {
//       res = str2U8a(z.toString(16));
//     }
//     console.timeEnd("native2");
//     console.log(BigInt("0x" + u8a2Str(res as any)) === z);
//   }
// }
// console.groupEnd();

// console.group("[TEST] u8a to bigint");
// {
//   {
//     console.time("js2/native1");
//     const str = z.toString(16);
//     let res;
//     for (let i = 0; i < TIMES; i++) {
//       res = BigInt("0x" + str);
//     }
//     console.timeEnd("js2/native1");
//     console.log(res === z);
//   }
//   {
//     console.time("native2");
//     const str = str2U8a(z.toString(16));
//     let res;
//     for (let i = 0; i < TIMES; i++) {
//       res = BigInt("0x" + u8a2Str(str));
//     }
//     console.timeEnd("native2");
//     console.log(res === z);
//   }
// }
// console.groupEnd();
