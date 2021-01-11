declare namespace BFChainComproto {

  interface IHanlder {
    handlerName: string;
    serialize?: (...arg: any[]) => unknown;
    deserialize?: (...arg: any[]) => unknown;
  }
  type ITransferHandler = IHanlder & {
    canHandle: (...arg: any[]) => boolean;
  };

  type HandlerObject = unknown & { [HANDLER_SYMBOL]?: string };

  interface Handler<I = unknown, O = unknown, D = I> extends IHanlder {
    handlerName: string;
    serialize?: (value: I) => O;
    deserialize?: (value: O) => D;
  }
  /** 自定义handler */
  interface TransferCustomHandler<I = unknown, O = unknown, D = I> extends Handler<I, O, D> {}

  /** canHandler 的handler */
  interface TransferHandler<I = unknown, O = unknown, D = I> extends Handler<I, O, D> {
    canHandle: (obj: I) => boolean;
  }
  type HandlerTypeObject = undefined | null | BigIntConstructor;
  type HandlerClass = AnyClass;
  type GetTransferClassInstance<T> = T extends AnyClass ? InstanceType<T> : (T extends BigIntConstructor ? bigint : T);
  interface TransferClassHandler<
    H extends HandlerClass = HandlerClass,
    O = GetTransferClassInstance<H>,
    D = GetTransferClassInstance<H>
  > extends Handler<GetTransferClassInstance<H>, O, D> {
    handlerObj: H & { [HANDLER_SYMBOL]?: string };
  }
  interface TransferProtoHandler extends Handler {
    handlerObj: unknown;
  }
  type TransferDataArray = [unknown, number[], string[]];

  type TransferType = AnyClass | HandlerTypeObject;

  interface typeTransferHandler<T extends BFChainComproto.TransferType = BFChainComproto.TransferType> {
    typeName: import('./const').dataTypeEnum,
    typeClass: T,
    serialize: (data: BFChainComproto.GetTransferClassInstance<T>, comproto: import('./Comproto').Comproto) => Uint8Array;
    deserialize: (buf: Uint8Array, tagOffset: number, comproto: import('./Comproto').Comproto) => BFChainComproto.GetTransferClassInstance<T>;
  }
  
  type typeHandler = {
    typeName: import('./const').dataTypeEnum,
    typeClass: BFChainComproto.TransferType,
    serialize: (data: BFChainComproto.GetTransferClassInstance<BFChainComproto.TransferType>, comproto: import('./Comproto').Comproto) => Uint8Array;
    deserialize: (buf: Uint8Array, tagOffset: number, comproto: import('./Comproto').Comproto) => unknown;
  }

  interface CarryStorageRegister {
    carryBitOne: () => void;
    carryBitZero: () => void;
    readBit: () => number;
    getU8a: () => Uint8Array;
    getStateNumberArray: () => number[];
  }
}
