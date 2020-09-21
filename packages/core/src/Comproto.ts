
import { CarryStorageRegister } from '@bfchain/comproto-helps';
import { pack, unpack } from '@bfchain/comproto-json-pack';

import { jsDataTypeEnum } from './jsDataTypeEnum'
export const TRANSFER_SYMBOL = Symbol('TRANSFER_SYMBOL');

export class Comproto {
    protected handlerMap: Map<string, BFChainComproto.Handler> = new Map();
    protected handlerListMap: Map<string, BFChainComproto.TransferHandler> = new Map();
    protected customHandlerMapList: Map<string, Set<any>> = new Map();
    public serialize(value: any): BFChainComproto.ComprotoBuffer {
        const transferState: BFChainComproto.TransferState = {
            carryStorageRegister: new CarryStorageRegister(),
            transferHandlerNameArray: [],
        };
        const transferValue = this.serializeTransfer(value, transferState);
        const bufferData = pack([transferValue, transferState.carryStorageRegister.getStateNumberArray(), transferState.transferHandlerNameArray]);
        return bufferData;
    }
    public deserialize(buffer: BFChainComproto.ComprotoBuffer) {
        const [originData, transferStateNumberArray, transferHandlerNameArray] = unpack(buffer) as BFChainComproto.TransferDataArray;
        const transferState: BFChainComproto.TransferState = {
            carryStorageRegister: new CarryStorageRegister(Uint8Array.from(transferStateNumberArray)),
            transferHandlerNameArray,
        };
        const transferData =  this.deserializeTransfer(originData, transferState);
        return transferData;
    }
    public getHandler(obj: any): BFChainComproto.Handler | undefined {
        try {
            const handlerName = obj[TRANSFER_SYMBOL];
            if (typeof handlerName === 'string') {
                return this.getHandlerByhandlerName(handlerName);
            }
        } catch (err) {}
        let returnHandler: BFChainComproto.Handler | undefined = undefined;
        this.handlerListMap.forEach((handler, key) => {
            if (handler.canHandler(obj)) {
                returnHandler = handler;
                return;
            }
        });
        return returnHandler;
    }
    public canHandler(obj: any): boolean {
        return !!this.getHandler(obj);
    }
    public addCustomHandler(
        handler: BFChainComproto.TransferCustomHandler
    ) {
        this.canAddHandler(handler);
        this.handlerMap.set(handler.handlerName, handler);
    }
    public setCustomHandler(
        obj: any,
        handlerName: string,
    ) {
        let handlerList = this.customHandlerMapList.get(handlerName);
        if  (handlerList == undefined) {
            handlerList = new Set();
            this.customHandlerMapList.set(handlerName, handlerList);
        }
        handlerList.add(obj);
        Object.defineProperty(obj, TRANSFER_SYMBOL, {
            value: handlerName,
            writable: true,
            configurable: true,
            enumerable: false
        });
    }
    public deleteCustomHandler(handlerName?: string) {
        if (!handlerName) {
            this.customHandlerMapList.forEach((handlerList, mHandlerName) => {
                handlerList.forEach(obj => {
                    delete obj[TRANSFER_SYMBOL];
                });
                this.handlerMap.delete(mHandlerName);
            });
            this.customHandlerMapList = new Map();
        } else {
            const handlerList = this.customHandlerMapList.get(handlerName);
            if (handlerList) {
                handlerList.forEach(obj => {
                    delete obj[TRANSFER_SYMBOL];
                });
            }
            this.handlerMap.delete(handlerName);
        }
    }
    public addClassHandler(
        handler: BFChainComproto.TransferClassHandler
    ) {
        this.canAddHandler(handler);
        const handlerName = handler.handlerName;
        Object.defineProperty(handler.handlerObj.prototype, TRANSFER_SYMBOL, {
            value: handlerName,
            writable: true,
            configurable: true,
            enumerable: false
        });
        this.handlerMap.set(handlerName, handler);
    }
    public deleteClassHandler(handlerName: string) {
        const handler = this.handlerMap.get(handlerName);
        if (handler == undefined) {
            return;
        }
        delete (handler as BFChainComproto.TransferClassHandler).handlerObj.prototype[TRANSFER_SYMBOL];
        this.handlerMap.delete(handlerName);
    }
    public addHandler(handler: BFChainComproto.TransferHandler) {
        this.canAddHandler(handler);
        this.handlerListMap.set(handler.handlerName, handler);
        this.handlerMap.set(handler.handlerName, handler);
    }
    protected canAddHandler(handler: BFChainComproto.Handler) {
        const handlerName = handler.handlerName;
        const mHandler = this.handlerMap.get(handlerName);
        if (mHandler) {
            throw new Error('add a exist handler, please delete it before add');
        }
    }
    public deleteHandler(handlerName: string) {
        this.handlerListMap.delete(handlerName);
        this.handlerMap.delete(handlerName);
    }
    public addProtoHandler(handler: BFChainComproto.TransferProtoHandler) {
        this.canAddHandler(handler);
        const handlerName = handler.handlerName;
        Object.defineProperty(handler.handlerObj, TRANSFER_SYMBOL, {
            value: handlerName,
            writable: true,
            configurable: true,
            enumerable: false
        });
        this.handlerMap.set(handlerName, handler);
    }
    public deleteProtoHandler(handlerName: string) {
        const handler = this.handlerMap.get(handlerName);
        if (handler == undefined) {
            return;
        }
        delete (handler as BFChainComproto.TransferProtoHandler).handlerObj[TRANSFER_SYMBOL];
        this.handlerMap.delete(handlerName);
    }
    public serializeTransfer(value: any, transferState: BFChainComproto.TransferState): any {
        const [isdeserialize, transferValue] = this.serializeTransferProto(value, transferState);
        if (isdeserialize) {
            return transferValue;
        }
        const valueType = Object.prototype.toString.call(value);
        if (valueType === '[object Object]' && !!value) {
            const obj: { [key: string]: any } = {};
            Object.keys(value).sort().forEach((attr: string) => {
                obj[attr] = this.serializeTransfer(value[attr], transferState);
            });
            return obj;
        }
        if (valueType === '[object Array]') {
            const valueArray = [...value];
            return valueArray.map((obj) => {
                return this.serializeTransfer(obj, transferState);
            });
        }
        return value;
    }
    private serializeTransferProto(value: any, transferState: BFChainComproto.TransferState): [
        boolean,
        any?,
    ] {
        const valueType = Object.prototype.toString.call(value);
        if (valueType === '[object Number]' && isNaN(value)) {
            transferState.carryStorageRegister.carryBitOne();
            transferState.transferHandlerNameArray.push(jsDataTypeEnum.NaN);
            return [true, ''];
        }
        if (valueType === '[object Undefined]') {
            transferState.carryStorageRegister.carryBitOne();
            transferState.transferHandlerNameArray.push(jsDataTypeEnum.Undefined);
            return [true, ''];
        }
        const handler = this.getHandler(value);
        if (!handler) {
            transferState.carryStorageRegister.carryBitZero();
            return [false];
        }
        transferState.transferHandlerNameArray.push(handler.handlerName);
        transferState.carryStorageRegister.carryBitOne();
        if (handler && typeof handler.serialize === 'function') {
            return [true, handler.serialize(value, transferState)];
        }
        return [true, undefined];
    }
    public getHandlerByhandlerName(handlerName: string): BFChainComproto.Handler | undefined {
        return this.handlerMap.get(handlerName);
    }
    public deserializeTransfer(originData: any, transferState: BFChainComproto.TransferState) {
        const canserialize = transferState.carryStorageRegister.readBit() === 1;
        if (canserialize) {
            const handlerName = transferState.transferHandlerNameArray.shift();
            if (typeof handlerName === 'string') {
                if (handlerName === jsDataTypeEnum.NaN) {
                    return NaN;
                }
                if (handlerName === jsDataTypeEnum.Undefined) {
                    return undefined;
                }
                const handler = this.getHandlerByhandlerName(handlerName);
                if (handler && typeof handler.deserialize === 'function') {
                    return handler.deserialize(originData, transferState);
                }
            }
            return originData;
        }
        const valueType = Object.prototype.toString.call(originData);
        if (valueType === '[object Object]' && !!originData) {
            const obj: {[key: string]: any} = {};
            Object.keys(originData).sort().forEach((attr: string) => {
                obj[attr] = this.deserializeTransfer(originData[attr], transferState);
            });
            return obj;
        }
        if (valueType === '[object Array]') {
            return originData.map((item: any) => this.deserializeTransfer(item, transferState));
        }
        if (valueType === '[object Error]') {
            delete originData['columnNumber'];
            delete originData['fileName'];
            delete originData['lineNumber'];
        }
        return originData;
    }
}
