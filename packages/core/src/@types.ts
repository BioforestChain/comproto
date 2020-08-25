
declare namespace BFChainComproto {
    interface TransferHandler {
        handlerObj?: any;
        encode: (value: any) => any;
        decode: (value: any) => any;
    }
    type TransferDataArray = [ Uint8Array, any, ...string[] ];
}
