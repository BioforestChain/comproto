import { Comproto } from './Comproto';

import { jsDataTypeEnum } from './jsDataTypeEnum';

export class ComprotoFactroy {
    public static getComproto(): Comproto {
        const comproto = new Comproto();
        this.initClassHandler(comproto);
        return comproto;
    }
    public static _singleton: Comproto | undefined;
    public static getSingleton(): Comproto {
        if (!this._singleton) {
            const comproto = new Comproto();
            this.initClassHandler(comproto);
            this._singleton = comproto;
        }
        return this._singleton;
    }
    public static initClassHandler(comproto: Comproto) {
        const self = comproto;
        const setHandler = {
            handlerName: jsDataTypeEnum.SET,
            handlerObj: Set,
            serialize(set: Set<any>, transferState: BFChainComproto.TransferState) {
                const arr =  [...set];
                return arr.map(item => self.serializeTransfer(item, transferState));
            },
            deserialize(objArray: any[], transferState: BFChainComproto.TransferState) {
                const arr = objArray.map(item => self.deserializeTransfer(item, transferState))
                return new Set(arr);
            },
        };
        comproto.addClassHandler(setHandler);
        const mapHandler = {
            handlerName: jsDataTypeEnum.MAP,
            handlerObj: Map,
            serialize(map: Map<any, any>, transferState: BFChainComproto.TransferState) {
                const arr = [...map];
                return arr.map((itemArr) => {
                    const [key, value] = itemArr;
                    return [ self.serializeTransfer(key, transferState), self.serializeTransfer(value, transferState) ]
                });
            },
            deserialize(arr: [any, any][], transferState: BFChainComproto.TransferState) {
                const objArray: [any, any][] = arr.map((itemArr) => {
                    const [key, value] = itemArr;
                    return [ self.deserializeTransfer(key, transferState), self.deserializeTransfer(value, transferState) ]
                });
                return new Map(objArray);
            },
        };
        comproto.addClassHandler(mapHandler);
        const bitIntHandler = {
            handlerName: jsDataTypeEnum.BigInt,
            handlerObj: BigInt,
            serialize(number: BigInt) {
                return String(number);
            },
            deserialize(numberString: string) {
                return BigInt(numberString);
            },
        };
        comproto.addClassHandler(bitIntHandler);
    }
}

