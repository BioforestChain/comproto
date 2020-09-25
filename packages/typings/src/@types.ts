declare namespace BFChainComproto {
  // TODO: not any type
  type AnyClass = any; // type AnyClass<P = any> = new (...args: any) => P;

  type ComprotoBuffer = NodeJS.TypedArray | Buffer;

  // TODO: undefined | null | Map | ...
  type AnyJSON = any;

  type AnyObject = object;

  const HANDLER_SYMBOL: unique symbol;

  type HandlerSymbol = typeof HANDLER_SYMBOL;
}
