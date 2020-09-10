
import { CarryStorageRegister } from '@bfchain/comproto-helps';
import { pack, unpack } from '@bfchain/comproto-json-pack';

import { jsDataTypeEnum } from './jsDataTypeEnum'
export const TRANSFER_SYMBOL = Symbol('TRANSFER_SYMBOL');

export class Comproto {
    protected protoMap: Map<string, BFChainComproto.TransferHandler> = new Map();
    public serialize(value: any): BFChainComproto.ComprotoBuffer {
        const transferState: BFChainComproto.TransferState = {
            carryStorageRegister: new CarryStorageRegister(),
            transferProtoNameArray: [],
        };
        const transferValue = this.serializeTransfer(value, transferState);
        const bufferData = pack([transferValue, transferState.carryStorageRegister.getStateNumberArray(), transferState.transferProtoNameArray]);
        return bufferData;
    }
    public deserialize(buffer: BFChainComproto.ComprotoBuffer) {
        const [originData, transferStateNumberArray, transferProtoNameArray] = unpack(buffer) as BFChainComproto.TransferDataArray;
        const transferState: BFChainComproto.TransferState = {
            carryStorageRegister: new CarryStorageRegister(Uint8Array.from(transferStateNumberArray)),
            transferProtoNameArray,
        };
        const transferData =  this.deserializeTransfer(originData, transferState);
        return transferData;
    }
    public canHanlder(obj: any) {
        try {
            return typeof obj[TRANSFER_SYMBOL] === 'string';
        } catch (err) {
            return false;
        }
    }
    public addClassHandler<C = BFChainComproto.AnyClass>(
        protoName: string,
        handler: BFChainComproto.TransferHandler
    ) {
        this.deleteClassHandler(protoName);
        Object.defineProperty(handler.handlerObj.prototype, TRANSFER_SYMBOL, {
            value: protoName,
            enumerable: false,
            writable: false,
            configurable: true,
        });
        this.protoMap.set(protoName, handler);
    }
    public addHandler<O = BFChainComproto.AnyObject>(protoName: string, handler: BFChainComproto.TransferHandler) {
        this.deleteHandler(protoName);
        Object.defineProperty(handler.handlerObj, TRANSFER_SYMBOL, {
            value: protoName,
            enumerable: false,
            writable: false,
            configurable: true,
        });
        this.protoMap.set(protoName, handler);
    }
    public deleteClassHandler(protoName: string) {
        const handler = this.protoMap.get(protoName);
        if (handler == undefined) {
            return;
        }
        delete handler.handlerObj.prototype[TRANSFER_SYMBOL];
        this.protoMap.delete(protoName);
    }
    public deleteHandler(protoName: string) {
        const handler = this.protoMap.get(protoName);
        if (handler == undefined) {
            return;
        }
        delete handler.handlerObj[TRANSFER_SYMBOL];
        this.protoMap.delete(protoName);
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
            transferState.transferProtoNameArray.push(jsDataTypeEnum.NaN);
            return [true, ''];
        }
        if (valueType === '[object Undefined]') {
            transferState.carryStorageRegister.carryBitOne();
            transferState.transferProtoNameArray.push(jsDataTypeEnum.Undefined);
            return [true, ''];
        }
        const canHandler = this.canHanlder(value);
        if (!canHandler) {
            transferState.carryStorageRegister.carryBitZero();
            return [false];
        }
        const protoName = value[TRANSFER_SYMBOL];
        transferState.transferProtoNameArray.push(protoName);
        transferState.carryStorageRegister.carryBitOne();
        const handler = this.protoMap.get(protoName);
        if (handler && typeof handler.serialize === 'function') {
            return [true, handler.serialize(value, transferState)];
        }
        return [false];
    }
    public deserializeTransfer(originData: any, transferState: BFChainComproto.TransferState) {
        const canserialize = transferState.carryStorageRegister.readBit() === 1;
        if (canserialize) {
            const protoName = transferState.transferProtoNameArray.shift();
            if (typeof protoName === 'string') {
                if (protoName === jsDataTypeEnum.NaN) {
                    return NaN;
                }
                if (protoName === jsDataTypeEnum.Undefined) {
                    return undefined;
                }
                const handler = this.protoMap.get(protoName);
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
