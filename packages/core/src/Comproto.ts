import { CarryStorageRegister } from "@bfchain/comproto-helps";
import { pack, unpack } from "@bfchain/comproto-json-pack";
import { HANDLER_SYMBOL } from "@bfchain/comproto-typings";

import { jsDataTypeEnum } from "./jsDataTypeEnum";

export class Comproto<H extends BFChainComproto.Handler = BFChainComproto.Handler> {
  protected handlerMap: Map<string, BFChainComproto.Handler> = new Map();
  protected handlerListMap: Map<string, BFChainComproto.TransferHandler> = new Map();
  get handlerMarker(): BFChainComproto.HandlerSymbol {
    return HANDLER_SYMBOL;
  }
  /**
   * 序列化一个对象
   * @param value
   */
  public serialize(value: any): BFChainComproto.ComprotoBuffer {
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
  public getHandler(obj: any): H | undefined {
    let returnHandler: BFChainComproto.Handler | undefined = undefined;
    try {
      const handlerName = obj[HANDLER_SYMBOL];
      if (typeof handlerName === "string") {
        returnHandler = this.getHandlerByhandlerName(handlerName);
      }
    } catch (err) {}
    if (returnHandler) {
      return returnHandler as H;
    }
    this.handlerListMap.forEach((handler) => {
      if (handler.canHandle(obj)) {
        returnHandler = handler;
        return;
      }
    });
    return returnHandler;
  }
  public canHandle(obj: any): boolean {
    return !!this.getHandler(obj);
  }
  public addCustomHandler(handler: BFChainComproto.TransferCustomHandler & H) {
    this.canAddHandler(handler);
    this.handlerMap.set(handler.handlerName, handler);
  }
  public deleteCustomHandler(handlerName: string) {
    this.handlerMap.delete(handlerName);
  }
  public addClassHandler(handler: BFChainComproto.TransferClassHandler & H) {
    this.canAddHandler(handler);
    const handlerName = handler.handlerName;
    this.setHandlerMarker(handler.handlerObj.prototype, handler.handlerName);
    this.handlerMap.set(handlerName, handler);
  }
  public deleteClassHandler(handlerName: string) {
    const handler = this.handlerMap.get(handlerName);
    if (handler == undefined) {
      return;
    }
    this.deleteHandlerMarker((handler as BFChainComproto.TransferClassHandler).handlerObj);
    this.handlerMap.delete(handlerName);
  }
  public addHandler(handler: BFChainComproto.TransferHandler & H) {
    this.canAddHandler(handler);
    this.handlerListMap.set(handler.handlerName, handler);
    this.handlerMap.set(handler.handlerName, handler);
  }
  public deleteHandler(handlerName: string) {
    this.handlerListMap.delete(handlerName);
    this.handlerMap.delete(handlerName);
  }
  public deleteHandlerMarker(handlerObj: any) {
    delete handlerObj[HANDLER_SYMBOL];
  }
  public setHandlerMarker(handlerObj: any, handlerName: string) {
    Object.defineProperty(handlerObj, HANDLER_SYMBOL, {
      value: handlerName,
      writable: true,
      configurable: true,
      enumerable: false,
    });
  }
  protected canAddHandler(handler: BFChainComproto.Handler) {
    const handlerName = handler.handlerName;
    const mHandler = this.handlerMap.get(handlerName);
    if (mHandler) {
      throw new Error("add a exist handler, please delete it before add");
    }
  }
  public serializeTransfer(value: any, transferState: BFChainComproto.TransferState): any {
    const [isdeserialize, transferValue] = this.serializeTransferProto(value, transferState);
    if (isdeserialize) {
      return transferValue;
    }
    const valueType = Object.prototype.toString.call(value);
    if (valueType === "[object Object]" && !!value) {
      const obj: { [key: string]: any } = {};
      Object.keys(value)
        .sort()
        .forEach((attr: string) => {
          obj[attr] = this.serializeTransfer(value[attr], transferState);
        });
      return obj;
    }
    if (valueType === "[object Array]") {
      const valueArray = [...value];
      return valueArray.map((obj) => {
        return this.serializeTransfer(obj, transferState);
      });
    }
    return value;
  }
  private serializeTransferProto(
    value: any,
    transferState: BFChainComproto.TransferState,
  ): [boolean, any?] {
    if (Number.isNaN(value)) {
      transferState.carryStorageRegister.carryBitOne();
      transferState.transferHandlerNameArray.push(jsDataTypeEnum.NaN);
      return [true, ""];
    }
    if (undefined === value) {
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
  public getHandlerByhandlerName(handlerName: string): (BFChainComproto.Handler & H) | undefined {
    type z = CallableFunction
    return this.handlerMap.get(handlerName) as BFChainComproto.Handler & H;
  }
  public deserializeTransfer(originData: any, transferState: BFChainComproto.TransferState): any {
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
    if (typeof originData === "object" && originData !== null) {
      const obj: { [key: string]: any } = {};
      Object.keys(originData)
        .sort()
        .forEach((attr: string) => {
          obj[attr] = this.deserializeTransfer(originData[attr], transferState);
        });
      return obj;
    }
    if (originData instanceof Array) {
      return originData.map((item: any) => this.deserializeTransfer(item, transferState));
    }
    if (valueType === "[object Error]") {
      delete originData["columnNumber"];
      delete originData["fileName"];
      delete originData["lineNumber"];
    }
    return originData;
  }
}
