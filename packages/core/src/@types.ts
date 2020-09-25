declare namespace BFChainComproto {
  type TransferState = {
    carryStorageRegister: CarryStorageRegister;
    transferHandlerNameArray: string[];
  };

  interface Handler {
    handlerName: string;
    serialize?: (value: any, transferState: TransferState) => any;
    deserialize?: (value: any, transferState: TransferState) => any;
  }
  interface TransferCustomHandler extends Handler {}
  interface TransferHandler extends Handler {
    canHandle: (obj: any) => boolean;
  }
  interface TransferClassHandler extends Handler {
    handlerObj: AnyClass & BigInt;
  }
  interface TransferProtoHandler extends Handler {
    handlerObj: any;
  }
  type TransferDataArray = [any, number[], string[]];

  interface CarryStorageRegister {
    carryBitOne: () => void;
    carryBitZero: () => void;
    readBit: () => number;
    getU8a: () => Uint8Array;
    getStateNumberArray: () => number[];
  }
}
