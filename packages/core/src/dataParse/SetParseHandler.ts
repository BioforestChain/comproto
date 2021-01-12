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
  import type { Comproto } from '../Comproto';
  export default class SetParseHandler implements BFChainComproto.typeTransferHandler<Set<unknown>> {
      constructor(comproto: Comproto) {
          comproto.setTypeHandler(this);
      }
      typeName = dataTypeEnum.Set;
      serialize(data: Set<unknown>, comproto: Comproto) {
          return new Uint8Array();
      }
      deserialize(decoderState: BFChainComproto.decoderState) {
          return new Set();
      }
  }
  
  
  