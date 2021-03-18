declare namespace BFChainComproto {
  type decoderState = {
    buffer: Uint8Array;
    offset: number;
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
  type GetTransferClassInstance<T> = T extends AnyClass
    ? InstanceType<T>
    : T extends BigIntConstructor
    ? bigint
    : T;
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

  interface typeTransferHandler<T = unknown, O = T> {
    typeName: import("./const").dataTypeEnum;
    serialize: (data: T, comproto: import("./Comproto").Comproto) => Uint8Array;
    deserialize: (decoderState: decoderState, comproto: import("./Comproto").Comproto) => O;
  }

  type typeHandler = {
    typeName: import("./const").dataTypeEnum;
    serialize: (data: unknown, comproto: import("./Comproto").Comproto) => Uint8Array;
    deserialize: (decoderState: decoderState, comproto: import("./Comproto").Comproto) => unknown;
  };

  interface CarryStorageRegister {
    carryBitOne: () => void;
    carryBitZero: () => void;
    readBit: () => number;
    getU8a: () => Uint8Array;
    getStateNumberArray: () => number[];
  }
}
