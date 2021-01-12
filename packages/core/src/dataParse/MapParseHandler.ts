  //   comproto.addClassHandler<typeof Map, [unknown, unknown][]>({
  //     handlerName: jsDataTypeEnum.MAP,
  //     handlerObj: Map,
  //     serialize(map, transferState) {
  //       const arr = [...map];
  //       return arr.map((itemArr) => {
  //         const [key, value] = itemArr;
  //         return [
  //           comproto.serializeTransfer(key, transferState),
  //           comproto.serializeTransfer(value, transferState),
  //         ];
  //       });
  //     },
  //     deserialize(arr, transferState) {
  //       const objArray = arr.map((itemArr) => {
  //         const [key, value] = itemArr;
  //         return [
  //           comproto.deserializeTransfer(key, transferState),
  //           comproto.deserializeTransfer(value, transferState),
  //         ] as [unknown, unknown];
  //       });
  //       return new Map(objArray);
  //     },
  //   });

import { dataTypeEnum } from '../const';
import type { Comproto } from '../Comproto';
export default class MapParseHandler implements BFChainComproto.typeTransferHandler<Map<unknown, unknown>> {
    constructor(comproto: Comproto) {
        comproto.setTypeHandler(this);
    }
    typeName = dataTypeEnum.Map;
    typeClass = Map;
    serialize(data: Map<unknown, unknown>, comproto: Comproto) {
        return new Uint8Array();
    }
    deserialize(buf: Uint8Array) {
        return new Map();
    }
}


