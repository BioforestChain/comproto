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

export default {
    typeName: dataTypeEnum.Map,
    typeClass: Map,
    serialize(data, comproto) {
        return new Uint8Array();
    },
    deserialize(buf) {
        return new Map();
    },
} as BFChainComproto.typeTransferHandler<typeof Map>;

