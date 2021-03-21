import { getDataType, u8aConcat } from "@bfchain/comproto-helps";
import { HANDLER_SYMBOL } from "@bfchain/comproto-typings";
import { dataTypeEnum } from "./const";

export class Comproto {
  /**基于原型链的检测 */
  protected protorHandlerMap: Map<string, BFChainComproto.IProtorHanlder> = new Map();
  /**基于函数的检测 */
  protected checkerHandlerMap: Map<string, BFChainComproto.ICheckerHandler> = new Map();
  protected tagTypeMap: Map<number, dataTypeEnum> = new Map();
  protected typeHandlerMap: Map<dataTypeEnum, BFChainComproto.TypeTransferHandler> = new Map();
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
    let returnHandler: BFChainComproto.Handler | undefined;
    // 先尝试查看属性是否有解析标签
    try {
      const handlerName = (obj as BFChainComproto.HandlerProtor)[HANDLER_SYMBOL];
      if (typeof handlerName === "string") {
        returnHandler = this.getHandlerByhandlerName(handlerName);
      }
    } catch (err) {}
    if (returnHandler === undefined && this.checkerHandlerMap.size > 0) {
      // 再看看有没有可以处理此对象的handler
      for (const handler of this.checkerHandlerMap.values()) {
        if (handler.canHandle(obj)) {
          returnHandler = handler;
          break;
        }
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
   * @param handlerInfo
   */
  public addCustomHandler<I = unknown, O = unknown, D = I, N extends string = string>(
    handlerInfo: {
      handlerName: N;
      serialize?: BFChainComproto.Handler.Serialize<I, O>;
      deserialize?: BFChainComproto.Handler.Deserialize<O, D>;
    },
    serialize?: BFChainComproto.Handler.Serialize<I, O>,
    deserialize?: BFChainComproto.Handler.Deserialize<O, D>,
  ) {
    const { handlerName } = handlerInfo;
    this.$confirmCanAddHandler(handlerName);
    this.protorHandlerMap.set(handlerName, {
      handlerName,
      serialize: serialize || handlerInfo.serialize,
      deserialize: deserialize || handlerInfo.deserialize,
    });
  }
  /**
   * @name 添加类handler
   * @description 在原型链的prototype属性添加解析标签
   *  这样基于这个类创建出来的实例会被处理
   * @param handler
   */
  addClassHandler<
    C extends BFChainComproto.HandlerClass = BFChainComproto.HandlerClass,
    O = unknown,
    N extends string = string
  >(
    handler: {
      classCtor: C;
      handlerName: N;
      serialize?: BFChainComproto.Handler.Serialize<BFChainComproto.GetClassInstance<C>, O>;
      deserialize?: BFChainComproto.Handler.Deserialize<O, BFChainComproto.GetClassInstance<C>>;
    },
    serialize?: BFChainComproto.Handler.Serialize<BFChainComproto.GetClassInstance<C>, O>,
    deserialize?: BFChainComproto.Handler.Deserialize<O, BFChainComproto.GetClassInstance<C>>,
  ) {
    const handlerName = handler.handlerName;
    this.$confirmCanAddHandler(handlerName);
    this.setHandlerMarker(handler.classCtor.prototype, handler.handlerName);
    this.protorHandlerMap.set(handlerName, {
      handlerName,
      serialize: serialize || handler.serialize,
      deserialize: deserialize || handler.deserialize,
    });
  }
  /**
   * @name 添加handler
   * @description 在 canHandler 方法判断是否可以解析对象
   * @param handler
   */
  addCheckerHandler<I = unknown, O = unknown, D = I, N extends string = string>(
    handlerInfo: {
      handlerName: N;
      canHandle: BFChainComproto.Handler.CanHandle<I>;
      serialize?: BFChainComproto.Handler.Serialize<I, O>;
      deserialize?: BFChainComproto.Handler.Deserialize<O, D>;
    },
    serialize?: BFChainComproto.Handler.Serialize<I, O>,
    deserialize?: BFChainComproto.Handler.Deserialize<O, D>,
  ) {
    const { handlerName, canHandle } = handlerInfo;
    this.$confirmCanAddHandler(handlerName);
    // this.handlerListMap.set(handler.handlerName, handler);
    this.checkerHandlerMap.set(handlerName, {
      handlerName,
      canHandle,
      serialize: serialize || handlerInfo.serialize,
      deserialize: deserialize || handlerInfo.deserialize,
    });
  }
  /**
   * @name 删除handler
   * @param handler
   */
  deleteHandler(handlerName: string) {
    const handler = this.protorHandlerMap.get(handlerName); //|| this.checkerHandlerMap.get(handlerName);
    if (handler === undefined) {
      return this.checkerHandlerMap.delete(handlerName);
    }
    if (handler.classCtor) {
      this.protorHandlerMap.delete(handlerName);
      this.deleteHandlerMarker(handler.classCtor.prototype);
    }
    return true;
  }
  /**
   * @name 删除解析标签
   * @param handlerObj
   */
  public deleteHandlerMarker(handlerObj: BFChainComproto.HandlerProtor) {
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
  protected $confirmCanAddHandler(handlerName: string) {
    if (this.protorHandlerMap.has(handlerName)) {
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
  setTypeHandler<T, O = T>(handler: BFChainComproto.TypeTransferHandler<T, O>) {
    if (this.typeHandlerMap.has(handler.typeName)) throw `typeName:${handler.typeName} is exsist`;
    this.typeHandlerMap.set(handler.typeName, handler as BFChainComproto.TypeTransferHandler);
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
    return this.typeHandlerMap.get(valueType);
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
    return this.protorHandlerMap.get(handlerName);
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
