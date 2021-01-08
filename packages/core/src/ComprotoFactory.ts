import { Comproto } from "./Comproto";
import { initDataParse } from './dataParse/index';

export class ComprotoFactroy {
  public static getComproto(): Comproto {
    const comproto = new Comproto();
    initDataParse(comproto);
    return comproto;
  }
  public static _singleton: Comproto | undefined;
  public static getSingleton(): Comproto {
    if (!this._singleton) {
      const comproto = new Comproto();
      initDataParse(comproto);
      this._singleton = comproto;
    }
    return this._singleton;
  }
}
