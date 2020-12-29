declare namespace BFChainComproto {
  type AnyClass<P = any> = new (...args: any) => P;
  type ComprotoBuffer = NodeJS.TypedArray | Buffer;


  type AnyObject = object;

  const HANDLER_SYMBOL: unique symbol;

  type HandlerSymbol = typeof HANDLER_SYMBOL;

}
