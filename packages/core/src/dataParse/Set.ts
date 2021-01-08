  //   comproto.addClassHandler<typeof Set, unknown[]>({
  //     handlerName: jsDataTypeEnum.SET,
  //     handlerObj: Set,
  //     serialize(set, transferState) {
  //       const arr = [...set];
  //       return arr.map((item) => comproto.serializeTransfer(item, transferState));
  //     },
  //     deserialize(objArray, transferState) {
  //       const arr = objArray.map((item) => comproto.deserializeTransfer(item, transferState));
  //       return new Set(arr);
  //     },
  //   });

  import { dataTypeEnum } from '../const';

  export default {
      typeName: dataTypeEnum.Set,
      typeClass: Set,
      serialize(data, comproto) {
          return new Uint8Array();
      },
      deserialize(buf) {
          return new Set();
      },
  } as BFChainComproto.typeTransferHandler<typeof Set>;
  