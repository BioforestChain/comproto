import { dataTypeEnum } from "../const";
import type { Comproto } from "../Comproto";
import helper from "./bytesHelper";

const enum ARRAY_TAGS {
  START = 0x90,
  END = 0x9f,
  ONE_EMPTY = 0xdc,
  MANY_EMPTY = 0xdd,
}

const _ONE_EMPTY = new Uint8Array([ARRAY_TAGS.ONE_EMPTY]);
const _LEN_CACHE_0 = new Uint8Array([ARRAY_TAGS.START]);
const _LEN_CACHE_1 = new Uint8Array([ARRAY_TAGS.START + 1]);
const _LEN_CACHE_2 = new Uint8Array([ARRAY_TAGS.START + 2]);
const _LEN_CACHE_3 = new Uint8Array([ARRAY_TAGS.START + 3]);
const _LEN_CACHE_4 = new Uint8Array([ARRAY_TAGS.START + 4]);
const _LEN_CACHE_5 = new Uint8Array([ARRAY_TAGS.START + 5]);
const _LEN_CACHE_6 = new Uint8Array([ARRAY_TAGS.START + 6]);
const _LEN_CACHE_7 = new Uint8Array([ARRAY_TAGS.START + 7]);
const _LEN_CACHE_8 = new Uint8Array([ARRAY_TAGS.START + 8]);
const _LEN_CACHE_9 = new Uint8Array([ARRAY_TAGS.START + 9]);
const _LEN_CACHE_10 = new Uint8Array([ARRAY_TAGS.START + 10]);
const _LEN_CACHE_11 = new Uint8Array([ARRAY_TAGS.START + 11]);
const _LEN_CACHE_12 = new Uint8Array([ARRAY_TAGS.START + 12]);
const _LEN_CACHE_13 = new Uint8Array([ARRAY_TAGS.START + 13]);
const _LEN_CACHE_14 = new Uint8Array([ARRAY_TAGS.START + 14]);
/**
 * fixarray -- 0x90 - 0x9f
 * array 16 -- 0xdc
 * array 32 -- 0xdd
 */
export default class ArrayParseHandler implements BFChainComproto.typeTransferHandler<unknown[]> {
  constructor(comproto: Comproto) {
    comproto.setTypeHandler(this);
    // fixarray -- 0x90 - 0x9f
    for (let i = ARRAY_TAGS.START; i <= ARRAY_TAGS.END; i++) {
      comproto.setTagType(i, dataTypeEnum.Array);
    }
    comproto.setTagType(0xdc, dataTypeEnum.Array);
    comproto.setTagType(0xdd, dataTypeEnum.Array);
  }
  typeName = dataTypeEnum.Array;
  serialize(dataArray: unknown[], resRef: BFChainComproto.U8AList, comproto: Comproto) {
    const arrLen = dataArray.length;
    /// length2Buf
    switch (arrLen) {
      case 0:
        resRef.push(_LEN_CACHE_0);
        break;
      case 1:
        resRef.push(_LEN_CACHE_1);
        break;
      case 2:
        resRef.push(_LEN_CACHE_2);
        break;
      case 3:
        resRef.push(_LEN_CACHE_3);
        break;
      case 4:
        resRef.push(_LEN_CACHE_4);
        break;
      case 5:
        resRef.push(_LEN_CACHE_5);
        break;
      case 6:
        resRef.push(_LEN_CACHE_6);
        break;
      case 7:
        resRef.push(_LEN_CACHE_7);
        break;
      case 8:
        resRef.push(_LEN_CACHE_8);
        break;
      case 9:
        resRef.push(_LEN_CACHE_9);
        break;
      case 10:
        resRef.push(_LEN_CACHE_10);
        break;
      case 11:
        resRef.push(_LEN_CACHE_11);
        break;
      case 12:
        resRef.push(_LEN_CACHE_12);
        break;
      case 13:
        resRef.push(_LEN_CACHE_13);
        break;
      case 14:
        resRef.push(_LEN_CACHE_14);
        break;
      default:
        const lenBytes = [ARRAY_TAGS.END];
        helper.len2Buf(arrLen, lenBytes, 1);
        resRef.push(lenBytes);
    }

    /// 这种 for of 是会遍历出稀疏数组的每一个元素
    let preIndex = -1;
    /// 使用forEach可以跳过稀疏数组
    dataArray.forEach((value, index) => {
      /// 发现稀疏数组，进行标记
      if (index !== ++preIndex) {
        const manyEmptyCount = index - preIndex;
        preIndex = index;
        /// 是否有多个 empty
        resRef.push(
          manyEmptyCount === 1
            ? _ONE_EMPTY
            : helper.len2Buf(manyEmptyCount, [ARRAY_TAGS.MANY_EMPTY], 1),
        );
      }
      /// 写入值
      comproto.serializeTransfer(value, resRef);
    });
    /// 检测末尾是否也有稀疏数组
    if (arrLen !== ++preIndex) {
      const manyEmptyCount = arrLen - preIndex;
      /// 是否有多个 empty
      resRef.push(
        manyEmptyCount === 0
          ? _ONE_EMPTY
          : helper.len2Buf(manyEmptyCount, [ARRAY_TAGS.MANY_EMPTY], 1),
      );
    }
  }
  deserialize(decoderState: BFChainComproto.decoderState, comproto: Comproto) {
    const tag = decoderState.buffer[decoderState.offset++];
    /// getLength
    let arrLen = tag ^ ARRAY_TAGS.START;
    if (arrLen === 15) {
      arrLen = helper.getLen(decoderState);
    }

    const dataArray = new Array(arrLen);
    for (let i = 0; i < arrLen; i++) {
      const tag = decoderState.buffer[decoderState.offset];
      switch (tag) {
        case ARRAY_TAGS.ONE_EMPTY:
          ++decoderState.offset;
          continue;
        case ARRAY_TAGS.MANY_EMPTY:
          ++decoderState.offset;
          i += helper.getLen(decoderState);
          continue;
        default:
          const data = comproto.deserializeTransfer(decoderState);
          dataArray[i] = data;
      }
    }
    return dataArray;
  }
}
