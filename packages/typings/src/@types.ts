declare namespace BFChainComproto {

    type AnyClass<P = any> = new (...args: any) => P;

    type AnyBuffer = NodeJS.TypedArray | Buffer;

    // TODO: undefined | null | Map | ...
    type AnyJSON = any;

    type AnyObject = object;

}