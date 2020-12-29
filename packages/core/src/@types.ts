declare namespace BFChainComproto {
  type TransferState = {
    carryStorageRegister: CarryStorageRegister;
    transferHandlerNameArray: string[];
  };

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
    serialize?: (value: I, transferState: TransferState) => O;
    deserialize?: (value: O, transferState: TransferState) => D;
  }
  interface TransferCustomHandler<I = unknown, O = unknown, D = I> extends Handler<I, O, D> {}
  interface TransferHandler<I = unknown, O = unknown, D = I> extends Handler<I, O, D> {
    canHandle: (obj: I) => boolean;
  }
  type HanlderClass = AnyClass | BigIntConstructor;
  // type TransferClass<T> = T extends (arg: infer BigIntConstructor) => void ? BigIntConstructor : AnyClass;
  type GetTransferClassInstance<T> = T extends AnyClass ? InstanceType<T> : BigInt;
  interface TransferClassHandler<
    H extends HanlderClass = HanlderClass,
    O = GetTransferClassInstance<H>,
    D = GetTransferClassInstance<H>
  > extends Handler<GetTransferClassInstance<H>, O, D> {
    handlerObj: H & { [HANDLER_SYMBOL]?: string };
  }
  interface TransferProtoHandler extends Handler {
    handlerObj: unknown;
  }
  type TransferDataArray = [unknown, number[], string[]];

  interface CarryStorageRegister {
    carryBitOne: () => void;
    carryBitZero: () => void;
    readBit: () => number;
    getU8a: () => Uint8Array;
    getStateNumberArray: () => number[];
  }
}
