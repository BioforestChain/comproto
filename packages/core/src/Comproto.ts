import { getDataType, u8aConcat } from "@bfchain/comproto-helps";
import { HANDLER_SYMBOL } from "@bfchain/comproto-typings";
import { dataTypeEnum } from "./const";

type serializeTransferResult = { isSerialize: boolean }; //| { isSerialize: true;};

export class Comproto {
  protected handlerMap: Map<string, BFChainComproto.IHanlder> = new Map();
  protected handlerListMap: Map<string, BFChainComproto.ITransferHandler> = new Map();
  protected tagTypeMap: Map<number, dataTypeEnum> = new Map();
  protected typeHandlerMap: Map<dataTypeEnum, BFChainComproto.typeHandler> = new Map();
  get handlerMarker(): BFChainComproto.HandlerSymbol {
    return HANDLER_SYMBOL;
  }
  public serialize(value: unknown): Uint8Array {
    const u8aList: BFChainComproto.U8AList = [];
    this.serializeTransfer(value, u8aList);
    return u8aConcat(u8aList);
  }
  public deserialize<T = unknown>(buffer: Uint8Array) {
    const decoderState: BFChainComproto.decoderState = {
      buffer: buffer,
      offset: 0,
    };
    const transferData = this.deserializeTransfer(decoderState);
    return transferData as T;
  }
  public setTagType(tag: number, type: dataTypeEnum) {
    if (this.tagTypeMap.has(tag)) throw `tag::${tag} is exist`;
    this.tagTypeMap.set(tag, type);
  }
  /**
   * 获取handler
   * @param obj
   */
  public getHandler(obj: unknown) {
    let returnHandler: BFChainComproto.Handler | undefined = undefined;
    // 先尝试查看属性是否有解析标签
    try {
      const handlerName = (obj as BFChainComproto.HandlerObject)[HANDLER_SYMBOL];
      if (typeof handlerName === "string") {
        returnHandler = this.getHandlerByhandlerName(handlerName);
      }
    } catch (err) {}
    if (returnHandler) {
      return returnHandler;
    }
    // 再看看有没有可以处理此对象的handler
    for (const handler of this.handlerListMap.values()) {
      if (handler.canHandle(obj)) {
        returnHandler = handler;
        break;
      }
    }
    return returnHandler;
  }
  public canHandle(obj: unknown) {
    return !!this.getHandler(obj);
  }
  /**
   * @name 添加自定义handler
   * @description 主要针对开发者有设置标签的对象 setHandlerMarker
   * @param handler
   */
  public addCustomHandler<I = unknown, O = unknown, D = I>(
    handler: BFChainComproto.TransferCustomHandler<I, O, D>,
  ) {
    this.canAddHandler(handler);
    this.handlerMap.set(handler.handlerName, handler);
  }
  /**
   * @name 删除自定义handler
   * @param handlerName
   */
  public deleteCustomHandler(handlerName: string) {
    this.handlerMap.delete(handlerName);
  }
  /**
   * @name 添加类handler
   * @description 在原型链的prototype属性添加解析标签
   *  这样基于这个类创建出来的实例会被处理
   * @param handler
   */
  public addClassHandler<
    H extends BFChainComproto.HandlerClass,
    O,
    D = BFChainComproto.GetTransferClassInstance<H>
  >(handler: BFChainComproto.TransferClassHandler<H, O, D>) {
    this.canAddHandler(handler);
    const handlerName = handler.handlerName;
    this.setHandlerMarker(handler.handlerObj.prototype, handler.handlerName);
    this.handlerMap.set(handlerName, handler);
  }
  /**
   * @name 删除类handler
   * @param handlerName
   */
  public deleteClassHandler(handlerName: string) {
    const handler = this.handlerMap.get(handlerName) as BFChainComproto.TransferClassHandler;
    if (handler == undefined) {
      return;
    }
    this.handlerMap.delete(handlerName);
    if ("handlerObj" in handler) {
      this.deleteHandlerMarker(handler.handlerObj);
    }
  }
  /**
   * @name 添加handler
   * @description 在 canHandler 方法判断是否可以解析对象
   * @param handler
   */
  public addHandler<I = unknown, O = unknown, D = I>(
    handler: BFChainComproto.TransferHandler<I, O, D>,
  ) {
    this.canAddHandler(handler);
    this.handlerListMap.set(handler.handlerName, handler);
    this.handlerMap.set(handler.handlerName, handler);
  }
  /**
   * @name 删除handler
   * @param handler
   */
  public deleteHandler(handlerName: string) {
    this.handlerListMap.delete(handlerName);
    this.handlerMap.delete(handlerName);
  }
  /**
   * @name 删除解析标签
   * @param handlerObj
   */
  public deleteHandlerMarker(handlerObj: BFChainComproto.HandlerObject) {
    if (HANDLER_SYMBOL in handlerObj) {
      delete handlerObj[HANDLER_SYMBOL];
    }
  }
  /**
   * @name 设置解析标签
   * @description 是否可以解析对象的主要判断依据
   */
  public setHandlerMarker(handlerObj: unknown, handlerName: string) {
    Object.defineProperty(handlerObj, HANDLER_SYMBOL, {
      value: handlerName,
      writable: true,
      configurable: true,
      enumerable: false,
    });
  }
  /**
   * @name 是否可以添加handler
   */
  protected canAddHandler(handler: BFChainComproto.IHanlder) {
    const handlerName = handler.handlerName;
    const mHandler = this.handlerMap.get(handlerName);
    if (mHandler) {
      throw new ReferenceError("add a exist handler, please delete it before add");
    }
  }
  /**
   * @name 解析外部对象
   * @description 内部可以循环调用解析
   */
  serializeTransfer(value: unknown, u8aListRef: BFChainComproto.U8AList): void {
    // const u8aListRef: BFChainComproto.U8AList = [];
    const type = typeof value;
    // 优化性能 对于基础类型直接走系统
    if (type !== "object" && type !== "function" && type !== "symbol") {
      return this.serializeInternal(value, u8aListRef);
    }
    const isSerialize = this.serializeCustom(value, u8aListRef);
    if (isSerialize === false) {
      this.serializeInternal(value, u8aListRef);
    }
  }
  /**
   * 设置类型handler
   * @param handler
   */
  setTypeHandler<T, O = T>(handler: BFChainComproto.typeTransferHandler<T, O>) {
    if (this.typeHandlerMap.has(handler.typeName)) throw `typeName:${handler.typeName} is exsist`;
    this.typeHandlerMap.set(handler.typeName, handler as BFChainComproto.typeHandler);
  }
  /**
   * @name 通过判断对象类型进行解析
   * @description 主要处理一些js类型对象，转换成u8a(开发者尽量不管这层)
   * @param value
   */
  serializeInternal(value: unknown, u8aListRef: BFChainComproto.U8AList) {
    const typeHandler = this.getTransferTypeHandler(value);
    if (typeHandler) {
      const u8a = typeHandler.serialize(value, u8aListRef, this);
      if (u8a !== undefined) {
        u8aListRef.push(u8a);
      }
    }
    // return u8aConcat(u8aListRef);
  }
  getTransferTypeHandler(value: unknown) {
    const valueType = getDataType(value) as dataTypeEnum;
    const typeHandler = this.typeHandlerMap.get(valueType);
    if (typeHandler) {
      return typeHandler;
    }
    return undefined;
  }
  /** 判断是否可以序列化类型 */
  canTransferType(value: unknown) {
    return !!this.getTransferTypeHandler(value);
  }
  /**
   * 尝试自定义编译
   * @param value
   * @returns isSerialize 是否可以被自定义解析
   * @returns data 被解析完之后的数据
   */
  public serializeCustom(value: unknown, u8aListRef: BFChainComproto.U8AList): boolean {
    const handler = this.getHandler(value);
    if (!handler) {
      return false;
    }
    const typeHandler = this.typeHandlerMap.get(dataTypeEnum.Ext);
    if (!typeHandler) {
      throw new ReferenceError("ext handler not exitst");
    }
    const u8a = typeHandler.serialize(value, u8aListRef, this);
    if (u8a !== undefined) {
      u8aListRef.push(u8a);
    }
    return true;
  }
  /** 获取自定义handler */
  public getHandlerByhandlerName(handlerName: string) {
    return this.handlerMap.get(handlerName);
  }
  /** 解析buffer */
  public deserializeTransfer(decoderState: BFChainComproto.decoderState) {
    const tag = decoderState.buffer[decoderState.offset];
    if (tag === undefined) return;
    // 通过tag获取type,再交由type serialize解析
    const type = this.tagTypeMap.get(tag);
    if (!type) throw `can not resolve tag::${tag}`;
    const handler = this.typeHandlerMap.get(type);
    if (!handler) throw `can not find type handler::${type}`;
    return handler.deserialize(decoderState, this);
  }
}
