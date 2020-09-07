
declare namespace BFChainComproto {
    type TransferState = {
        carryStorageRegister: CarryStorageRegister,
        transferProtoNameArray: string[],
    };
    interface TransferHandler {
        handlerObj: any;
        serialize: (value: any, transferState: TransferState) => any;
        deserialize: (value: any, transferState: TransferState) => any;
    }
    type TransferDataArray = [ any, number[] ,string[] ];

    

    interface CarryStorageRegister {
        carryBitOne: () => void;
        carryBitZero: () => void;
        readBit: () => number;
        getU8a: () => Uint8Array;
        getStateNumberArray: () => number[];
    }
}
