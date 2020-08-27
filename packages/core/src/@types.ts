
declare namespace BFChainComproto {
    interface TransferHandler {
        handlerObj: any;
        serialize: (value: any) => any;
        deserialize: (value: any) => any;
    }
    type TransferDataArray = [ any, number[] ,string[] ];
}
