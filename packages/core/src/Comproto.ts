
import v8 from 'v8';
import { CarryStorageRegister } from '@bfchain/comproto-helps';

const TRANSFER_SYMBOL = Symbol('TRANSFER_SYMBOL');

type ITransferState = {
    carryStorageRegister: CarryStorageRegister,
    transferProtoNameArray: string[],
};

export default class Comproto {
    protected protoMap: Map<string, BFChainComproto.TransferHandler> = new Map();
    public encode(value: any) {
        const transferState: ITransferState = {
            carryStorageRegister: new CarryStorageRegister(),
            transferProtoNameArray: [],
        };
        const transferValue = this.encodeTransfer(value, transferState);
        return v8.serialize([transferState.carryStorageRegister.getU8a(), transferValue, ...transferState.transferProtoNameArray]);
    }
    public decode(buffer: BFChainComproto.AnyBuffer) {
        const [transferStateU8a, originData, ...transferProtoNameArray] = v8.deserialize(buffer) as BFChainComproto.TransferDataArray;
        const transferState: ITransferState = {
            carryStorageRegister: new CarryStorageRegister(transferStateU8a),
            transferProtoNameArray,
        };
        const transferData =  this.decodeTransfer(originData, transferState);
        return transferData;
    }
    public addClassHandler<C = BFChainComproto.AnyClass>(
        protoName: string,
        registerClass: C & { prototype: any },
        handler: BFChainComproto.TransferHandler
    ) {
        handler.handlerObj = registerClass;
        Object.defineProperty(registerClass.prototype, TRANSFER_SYMBOL, {
            value: protoName,
            enumerable: false,
            writable: false,
            configurable: true,
        });
        this.protoMap.set(protoName, handler);
    }
    public addHandler<O = BFChainComproto.AnyObject>(protoName: string, handlerObj: O, handler: BFChainComproto.TransferHandler) {
        handler.handlerObj = handlerObj;
        Object.defineProperty(handlerObj, TRANSFER_SYMBOL, {
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
    private encodeTransfer(value: any, transferState: ITransferState): any {
        const valueType = Object.prototype.toString.call(value);
        if (valueType === '[object Object]' && !!value) {
            const [isDecode, transferValue] = this.encodeTransferProto(value, transferState);
            if (isDecode) {
                return transferValue;
            }
            const obj: { [key: string]: any } = {};
            Object.keys(value).sort().forEach((attr: string) => {
                obj[attr] = this.encodeTransfer(value[attr], transferState);
            })
            return obj;
        }
        if (valueType === '[object Array]') {
            const [isDecode, transferValue] = this.encodeTransferProto(value, transferState);
            if (isDecode) {
                return transferValue;
            }
            const valueArray = [...value];
            return valueArray.map((obj) => {
                return this.encodeTransfer(obj, transferState);
            });
        }
        if (valueType === '[object Function]') {
            const [isDecode, transferValue] = this.encodeTransferProto(value, transferState);
            if (isDecode) {
                return transferValue;
            }
            return value;
        }
        if (valueType === '[object Promise]') {
            const [isDecode, transferValue] = this.encodeTransferProto(value, transferState);
            if (isDecode) {
                return transferValue;
            }
            return value;
        }
        transferState.carryStorageRegister.carryBitZero();
        return value;
    }
    private encodeTransferProto(value: any, transferState: ITransferState): [
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
        if (handler && typeof handler.encode === 'function') {
            return [true, handler.encode(value)];
        }
        return [false];
    }
    private decodeTransfer(originData: any, transferState: ITransferState) {
        const canencode = transferState.carryStorageRegister.readBit() === 1;
        // console.log('decodeTransfer', originData, canencode);
        if (canencode) {
            const protoName = transferState.transferProtoNameArray.shift();
            if (typeof protoName === 'string') {
                const handler = this.protoMap.get(protoName);
                if (handler && typeof handler.decode === 'function') {
                    return handler.decode(originData);
                }
            }
            return originData;
        }
        const valueType = Object.prototype.toString.call(originData);
        if (valueType === '[object Object]' && !!originData) {
            const obj: {[key: string]: any} = {};
            Object.keys(originData).forEach((attr: string) => {
                obj[attr] = this.decodeTransfer(originData[attr], transferState);
            });
            return obj;
        }
        if (valueType === '[object Array]') {
            return originData.map((item: any) => this.decodeTransfer(item, transferState));
        }
        return originData;
    }
}
