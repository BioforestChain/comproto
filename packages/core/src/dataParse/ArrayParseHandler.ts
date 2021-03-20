import { dataTypeEnum } from "../const";
import type { Comproto } from "../Comproto";
import helper from "./bytesHelper";

const enum ARRAY_TAGS {
  START = 0x90,
  END = 0x9f,
  ONE_EMPTY = 0xdc,
  MANY_EMPTY = 0xdd,
}

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
  private _ONE_EMPTY = new Uint8Array([ARRAY_TAGS.ONE_EMPTY]);
  private _LEN_CACHE = [new Uint8Array([ARRAY_TAGS.START])];
  serialize(dataArray: unknown[], resRef: BFChainComproto.U8AList, comproto: Comproto) {
    const arrLen = dataArray.length;
    /// length2Buf
    // 0~14 这14中可能直接使用tag
    if (arrLen <= 14) {
      resRef.push(
        this._LEN_CACHE[arrLen] ||
          (this._LEN_CACHE[arrLen] = new Uint8Array([ARRAY_TAGS.START | arrLen])),
      );
    } else {
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
            ? this._ONE_EMPTY
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
          ? this._ONE_EMPTY
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
