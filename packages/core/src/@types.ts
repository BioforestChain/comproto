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
  type HandlerClass = AnyClass | BigIntConstructor;
  // type TransferClass<T> = T extends (arg: infer BigIntConstructor) => void ? BigIntConstructor : AnyClass;
  type GetTransferClassInstance<T> = T extends AnyClass ? InstanceType<T> : BigInt;
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

  type typeTransferHandler<T extends BFChainComproto.HandlerClass = BFChainComproto.HandlerClass> = {
    typeName: string, // 可控
    typeClass: T, // 可控类
    serialize: (data: BFChainComproto.GetTransferClassInstance<T>, comproto: import('./Comproto').Comproto) => Uint8Array;
    deserialize: (buf: Uint8Array, comproto: import('./Comproto').Comproto) => BFChainComproto.GetTransferClassInstance<T>;
  };
  
  type typeHandler = {
    typeName: string,
    typeClass: BFChainComproto.HandlerClass,
    serialize: (...arg: any[]) => Uint8Array;
    deserialize: (...arg: any[]) => unknown;
  };

  interface CarryStorageRegister {
    carryBitOne: () => void;
    carryBitZero: () => void;
    readBit: () => number;
    getU8a: () => Uint8Array;
    getStateNumberArray: () => number[];
  }
}
