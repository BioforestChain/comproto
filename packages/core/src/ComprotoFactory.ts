import { Comproto } from "./Comproto";

import { jsDataTypeEnum } from "./jsDataTypeEnum";

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
    comproto.addClassHandler<typeof Set, unknown[]>({
      handlerName: jsDataTypeEnum.SET,
      handlerObj: Set,
      serialize(set, transferState) {
        const arr = [...set];
        return arr.map((item) => comproto.serializeTransfer(item, transferState));
      },
      deserialize(objArray, transferState) {
        const arr = objArray.map((item) => comproto.deserializeTransfer(item, transferState));
        return new Set(arr);
      },
    });
    comproto.addClassHandler<typeof Map, [unknown, unknown][]>({
      handlerName: jsDataTypeEnum.MAP,
      handlerObj: Map,
      serialize(map, transferState) {
        const arr = [...map];
        return arr.map((itemArr) => {
          const [key, value] = itemArr;
          return [
            comproto.serializeTransfer(key, transferState),
            comproto.serializeTransfer(value, transferState),
          ];
        });
      },
      deserialize(arr, transferState) {
        const objArray = arr.map((itemArr) => {
          const [key, value] = itemArr;
          return [
            comproto.deserializeTransfer(key, transferState),
            comproto.deserializeTransfer(value, transferState),
          ] as [unknown, unknown];
        });
        return new Map(objArray);
      },
    });
    comproto.addClassHandler<typeof BigInt, string>({
      handlerName: jsDataTypeEnum.BigInt,
      handlerObj: BigInt,
      serialize(number) {
        return String(number);
      },
      deserialize(numberString) {
        return BigInt(numberString);
      },
    });
  }
}
