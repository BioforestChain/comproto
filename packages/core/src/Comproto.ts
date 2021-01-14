import { getDataType } from "@bfchain/comproto-helps";
import { HANDLER_SYMBOL } from "@bfchain/comproto-typings";
import { dataTypeEnum } from "./const";

type serializeTransferResult = { isSerialize: false } | { isSerialize: true, data: Uint8Array };

export class Comproto {
  protected handlerMap: Map<string, BFChainComproto.IHanlder> = new Map();
  protected handlerListMap: Map<string, BFChainComproto.ITransferHandler> = new Map();
  protected tagTypeMap: Map<number, dataTypeEnum> = new Map();
  protected typeHandlerMap: Map<dataTypeEnum, BFChainComproto.typeHandler> = new Map();
  get handlerMarker(): BFChainComproto.HandlerSymbol {
    return HANDLER_SYMBOL;
  }
  public serialize(value: unknown): Uint8Array {
    const transferValue = this.serializeTransfer(value);
    return transferValue;
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
    this.handlerListMap.forEach((handler) => {
      if (handler.canHandle(obj)) {
        returnHandler = handler;
        return;
      }
    });
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
  public addCustomHandler<
    I = unknown, O = unknown, D = I
  >(handler: BFChainComproto.TransferCustomHandler<I, O, D>) {
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
  > (handler: BFChainComproto.TransferClassHandler<H, O, D>) {
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
    if ('handlerObj' in handler) {
      this.deleteHandlerMarker(handler.handlerObj);
    }
  }
  /**
   * @name 添加handler
   * @description 在 canHandler 方法判断是否可以解析对象
   * @param handler 
   */
  public addHandler<
    I = unknown, O = unknown, D = I
  >(handler: BFChainComproto.TransferHandler<I, O, D>) {
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
      throw new Error("add a exist handler, please delete it before add");
    }
  }
  /** 
   * @name 解析外部对象
   * @description 内部可以循环调用解析
   */
  serializeTransfer(value: unknown): Uint8Array {
    const serializeResult = this.serializeTransferProto(value);
    if (serializeResult.isSerialize) {
      return serializeResult.data;
    }
    return this.serializeTransferType(value);
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
  serializeTransferType(value: unknown) {
    if (ArrayBuffer.isView(value)) {
      const typeHandler = this.typeHandlerMap.get(dataTypeEnum.BufferView);
      if (!typeHandler) {
        throw 'buffer handler not exitst';
      }
      return typeHandler.serialize(value, this);
    }
    const valueType = getDataType(value) as dataTypeEnum;
    const typeHandler = this.typeHandlerMap.get(valueType);
    if (!typeHandler) {
      return new Uint8Array();
    }
    if (typeHandler.typeName === valueType) {
      return typeHandler.serialize(value, this);
    }
    return new Uint8Array();
  }
  /**
   * 尝试自定义编译
   * @param value 
   * @returns isSerialize 是否可以被自定义解析
   * @returns data 被解析完之后的数据
   */
  private serializeTransferProto(value: unknown): serializeTransferResult {
    const handler = this.getHandler(value);
    if (!handler) {
      return { isSerialize: false };
    }
    const typeHandler = this.typeHandlerMap.get(dataTypeEnum.Ext);
    if (!typeHandler) {
      throw 'ext handler not exitst'
    }
    return { isSerialize: true, data: typeHandler.serialize(value, this) };
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
