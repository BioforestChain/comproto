declare namespace BFChainComproto {
  type decoderState = {
    buffer: Uint8Array;
    offset: number;
  };
  //#region 内部存储使用的类型

  interface IProtorHanlder {
    handlerName: string;
    classCtor?: HandlerClass;
    serialize?: (...arg: any[]) => unknown;
    deserialize?: (...arg: any[]) => unknown;
  }
  interface ICheckerHandler extends IProtorHanlder {
    canHandle: (...arg: any[]) => boolean | void;
  }
  //#endregion
  //#region Handler相关的核心定义

  type HandlerProtor = { [HANDLER_SYMBOL]?: string };

  interface Handler<I = unknown, O = unknown, D = I, N extends string = string> extends IProtorHanlder {
    handlerName: N;
    serialize?: Handler.Serialize<I, O>;
    deserialize?: Handler.Deserialize<O, D>;
  }
  namespace Handler {
    type CanHandle<I = unknown> = (value: I) => boolean | void;
    type Serialize<I = unknown, O extends any = unknown> = (value: I) => O;
    type Deserialize<O = unknown, D = unknown> = (value: O) => D;
    namespace Serialize {
      type GetOut<T> = T extends Serialize<infer _, infer O> ? O : never;
    }
  }
  /** 基于原型链的handler */
  interface TransferByProtoHandler<I = unknown, O = unknown, D = I, N extends string = string> extends Handler<I, O, D, N> {}

  /** 基于检测器的handler */
  interface TransferByCheckerHandler<I = unknown, O = unknown, D = I, N extends string = string> extends Handler<I, O, D, N> {
    canHandle: (obj: I) => boolean;
  }

  type HandlerClass = AnyClass;
  type GetClassInstance<T> = T extends AnyClass ? InstanceType<T> : T extends BigIntConstructor ? bigint : T;

  /** 基于构造函数的handler */
  interface TransferByClassHandler<C extends HandlerClass = HandlerClass, O = unknown, N extends string = string>
    extends Handler<GetClassInstance<C>, O, GetClassInstance<C>, N> {
    classCtor: C;
  }
  //#endregion

  interface TypeTransferHandler<T = unknown, O = T> {
    typeName: import("./const").dataTypeEnum;
    serialize: (data: T, resRef: U8AList, comproto: import("./Comproto").Comproto) => ArrayLike<number> | void;
    deserialize: (decoderState: decoderState, comproto: import("./Comproto").Comproto) => O;
  }

  type U8AList = ArrayLike<number>[];

  interface CarryStorageRegister {
    carryBitOne: () => void;
    carryBitZero: () => void;
    readBit: () => number;
    getU8a: () => Uint8Array;
    getStateNumberArray: () => number[];
  }
}
