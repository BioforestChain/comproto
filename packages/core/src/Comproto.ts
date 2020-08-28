
import v8 from 'v8';
import { CarryStorageRegister } from '@bfchain/comproto-helps';

export const TRANSFER_SYMBOL = Symbol('TRANSFER_SYMBOL');

type ITransferState = {
    carryStorageRegister: CarryStorageRegister,
    transferProtoNameArray: string[],
};

export class Comproto {
    protected protoMap: Map<string, BFChainComproto.TransferHandler> = new Map();
    public serialize(value: any): BFChainComproto.ComprotoBuffer {
        const transferState: ITransferState = {
            carryStorageRegister: new CarryStorageRegister(),
            transferProtoNameArray: [],
        };
        const transferValue = this.serializeTransfer(value, transferState);
        return v8.serialize([transferValue, transferState.carryStorageRegister.getStateNumberArray(), transferState.transferProtoNameArray]);
    }
    public deserialize(buffer: BFChainComproto.ComprotoBuffer) {
        const [originData, transferStateNumberArray, transferProtoNameArray] = v8.deserialize(buffer) as BFChainComproto.TransferDataArray;
        const transferState: ITransferState = {
            carryStorageRegister: new CarryStorageRegister(Uint8Array.from(transferStateNumberArray)),
            transferProtoNameArray,
        };
        const transferData =  this.deserializeTransfer(originData, transferState);
        return transferData;
    }
    public canHanlder(obj: any) {
        if (typeof obj === 'string') {
            return false;
        }
        return typeof obj[TRANSFER_SYMBOL] === 'string';
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
    private serializeTransfer(value: any, transferState: ITransferState): any {
        const valueType = Object.prototype.toString.call(value);
        if (valueType === '[object Object]' && !!value) {
            const [isdeserialize, transferValue] = this.serializeTransferProto(value, transferState);
            if (isdeserialize) {
                return transferValue;
            }
            const obj: { [key: string]: any } = {};
            Object.keys(value).sort().forEach((attr: string) => {
                obj[attr] = this.serializeTransfer(value[attr], transferState);
            })
            return obj;
        }
        if (valueType === '[object Array]') {
            const [isdeserialize, transferValue] = this.serializeTransferProto(value, transferState);
            if (isdeserialize) {
                return transferValue;
            }
            const valueArray = [...value];
            return valueArray.map((obj) => {
                return this.serializeTransfer(obj, transferState);
            });
        }
        if (valueType === '[object Function]') {
            const [isdeserialize, transferValue] = this.serializeTransferProto(value, transferState);
            if (isdeserialize) {
                return transferValue;
            }
            return value;
        }
        if (valueType === '[object Promise]') {
            const [isdeserialize, transferValue] = this.serializeTransferProto(value, transferState);
            if (isdeserialize) {
                return transferValue;
            }
            return value;
        }
        transferState.carryStorageRegister.carryBitZero();
        return value;
    }
    private serializeTransferProto(value: any, transferState: ITransferState): [
        boolean,
        any?,
    ] {
        const protoName = value[TRANSFER_SYMBOL];
        if (typeof protoName !== 'string') {
            transferState.carryStorageRegister.carryBitZero();
            return [false];
        }
        transferState.transferProtoNameArray.push(protoName);
        transferState.carryStorageRegister.carryBitOne();
        const handler = this.protoMap.get(protoName);
        if (handler && typeof handler.serialize === 'function') {
            return [true, handler.serialize(value)];
        }
        return [false];
    }
    private deserializeTransfer(originData: any, transferState: ITransferState) {
        const canserialize = transferState.carryStorageRegister.readBit() === 1;
        if (canserialize) {
            const protoName = transferState.transferProtoNameArray.shift();
            if (typeof protoName === 'string') {
                const handler = this.protoMap.get(protoName);
                if (handler && typeof handler.deserialize === 'function') {
                    return handler.deserialize(originData);
                }
            }
            return originData;
        }
        const valueType = Object.prototype.toString.call(originData);
        if (valueType === '[object Object]' && !!originData) {
            const obj: {[key: string]: any} = {};
            Object.keys(originData).forEach((attr: string) => {
                obj[attr] = this.deserializeTransfer(originData[attr], transferState);
            });
            return obj;
        }
        if (valueType === '[object Array]') {
            return originData.map((item: any) => this.deserializeTransfer(item, transferState));
        }
        return originData;
    }
}
