import { CarryStorageRegister } from "@bfchain/comproto-helps";
import { pack, unpack } from "@bfchain/comproto-json-pack";
import { HANDLER_SYMBOL } from "@bfchain/comproto-typings";

import { jsDataTypeEnum } from "./jsDataTypeEnum";

export class Comproto {
  protected handlerMap: Map<string, BFChainComproto.IHanlder> = new Map();
  protected handlerListMap: Map<string, BFChainComproto.ITransferHandler> = new Map();
  get handlerMarker(): BFChainComproto.HandlerSymbol {
    return HANDLER_SYMBOL;
  }
  public serialize(value: unknown): BFChainComproto.ComprotoBuffer {
    const transferState: BFChainComproto.TransferState = {
      carryStorageRegister: new CarryStorageRegister(),
      transferHandlerNameArray: [],
    };
    const transferValue = this.serializeTransfer(value, transferState);
    const bufferData = pack([
      transferValue,
      transferState.carryStorageRegister.getStateNumberArray(),
      transferState.transferHandlerNameArray,
    ]);
    return bufferData;
  }
  public deserialize(buffer: BFChainComproto.ComprotoBuffer) {
    const [originData, transferStateNumberArray, transferHandlerNameArray] = unpack(
      buffer,
    ) as BFChainComproto.TransferDataArray;
    const transferState: BFChainComproto.TransferState = {
      carryStorageRegister: new CarryStorageRegister(Uint8Array.from(transferStateNumberArray)),
      transferHandlerNameArray,
    };
    const transferData = this.deserializeTransfer(originData, transferState);
    return transferData;
  }
  public getHandler(obj: unknown) {
    let returnHandler: BFChainComproto.Handler | undefined = undefined;
    try {
      const handlerName = (obj as BFChainComproto.HandlerObject)[HANDLER_SYMBOL];
      if (typeof handlerName === "string") {
        returnHandler = this.getHandlerByhandlerName(handlerName);
      }
    } catch (err) {}
    if (returnHandler) {
      return returnHandler;
    }
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
  public addCustomHandler<
    I = unknown, O = unknown, D = I
  >(handler: BFChainComproto.TransferCustomHandler<I, O, D>) {
    this.canAddHandler(handler);
    this.handlerMap.set(handler.handlerName, handler);
  }
  public deleteCustomHandler(handlerName: string) {
    this.handlerMap.delete(handlerName);
  }
  public addClassHandler<
    H extends BFChainComproto.HanlderClass,
    O,
    D = BFChainComproto.GetTransferClassInstance<H>
  > (handler: BFChainComproto.TransferClassHandler<H, O, D>) {
    this.canAddHandler(handler);
    const handlerName = handler.handlerName;
    this.setHandlerMarker(handler.handlerObj.prototype, handler.handlerName);
    this.handlerMap.set(handlerName, handler);
  }
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
  public addHandler<
    I = unknown, O = unknown, D = I
  >(handler: BFChainComproto.TransferHandler<I, O, D>) {
    this.canAddHandler(handler);
    this.handlerListMap.set(handler.handlerName, handler);
    this.handlerMap.set(handler.handlerName, handler);
  }
  public deleteHandler(handlerName: string) {
    this.handlerListMap.delete(handlerName);
    this.handlerMap.delete(handlerName);
  }
  public deleteHandlerMarker(handlerObj: BFChainComproto.HandlerObject) {
    delete handlerObj[HANDLER_SYMBOL];
  }
  public setHandlerMarker(handlerObj: unknown, handlerName: string) {
    Object.defineProperty(handlerObj, HANDLER_SYMBOL, {
      value: handlerName,
      writable: true,
      configurable: true,
      enumerable: false,
    });
  }
  protected canAddHandler(handler: BFChainComproto.IHanlder) {
    const handlerName = handler.handlerName;
    const mHandler = this.handlerMap.get(handlerName);
    if (mHandler) {
      throw new Error("add a exist handler, please delete it before add");
    }
  }
  public serializeTransfer(value: unknown, transferState: BFChainComproto.TransferState): unknown {
    const [isdeserialize, transferValue] = this.serializeTransferProto(value, transferState);
    if (isdeserialize) {
      return transferValue;
    }
    const valueType = Object.prototype.toString.call(value);
    if (value instanceof Object && valueType === "[object Object]" && !!value) {
      const obj: { [key: string]: unknown } = {};
      const val = value as { [key: string]: unknown };
      Object.keys(val)
        .sort()
        .forEach((attr: string) => {
          obj[attr] = this.serializeTransfer(val[attr], transferState);
        });
      return obj;
    }
    if (value instanceof Array && valueType === "[object Array]") {
      const valueArray = [...value];
      return valueArray.map((obj) => {
        return this.serializeTransfer(obj, transferState);
      });
    }
    return value;
  }
  private serializeTransferProto(
    value: unknown,
    transferState: BFChainComproto.TransferState,
  ): [boolean, unknown?] {
    const valueType = Object.prototype.toString.call(value);
    if (valueType === "[object Number]" && isNaN(value as number)) {
      transferState.carryStorageRegister.carryBitOne();
      transferState.transferHandlerNameArray.push(jsDataTypeEnum.NaN);
      return [true, ""];
    }
    if (valueType === "[object Undefined]") {
      transferState.carryStorageRegister.carryBitOne();
      transferState.transferHandlerNameArray.push(jsDataTypeEnum.Undefined);
      return [true, ""];
    }
    const handler = this.getHandler(value);
    if (!handler) {
      transferState.carryStorageRegister.carryBitZero();
      return [false];
    }
    transferState.transferHandlerNameArray.push(handler.handlerName);
    transferState.carryStorageRegister.carryBitOne();
    if (handler && typeof handler.serialize === "function") {
      return [true, handler.serialize(value, transferState)];
    }
    return [true, undefined];
  }
  public getHandlerByhandlerName(handlerName: string) {
    return this.handlerMap.get(handlerName);
  }
  public deserializeTransfer(originData: unknown, transferState: BFChainComproto.TransferState): unknown {
    const canserialize = transferState.carryStorageRegister.readBit() === 1;
    if (canserialize) {
      const handlerName = transferState.transferHandlerNameArray.shift();
      if (typeof handlerName === "string") {
        if (handlerName === jsDataTypeEnum.NaN) {
          return NaN;
        }
        if (handlerName === jsDataTypeEnum.Undefined) {
          return undefined;
        }
        const handler = this.getHandlerByhandlerName(handlerName);
        if (handler && typeof handler.deserialize === "function") {
          return handler.deserialize(originData, transferState);
        }
      }
      return originData;
    }
    const valueType = Object.prototype.toString.call(originData);
    if (valueType === "[object Object]" && !!originData) {
      const obj: { [key: string]: unknown } = {};
      const oData = originData as { [key: string]: unknown };
      Object.keys(oData)
        .sort()
        .forEach((attr: string) => {
          obj[attr] = this.deserializeTransfer(oData[attr], transferState);
        });
      return obj;
    }
    if (valueType === "[object Array]" && originData instanceof Array) {
      return originData.map((item: unknown) => this.deserializeTransfer(item, transferState));
    }
    if (valueType === "[object Error]"  && originData instanceof Error) {
      /// 针对 msg-lite 的bug
      const oData = originData as any;
      delete oData["columnNumber"];
      delete oData["fileName"];
      delete oData["lineNumber"];
      return oData;
    }
    return originData;
  }
}
