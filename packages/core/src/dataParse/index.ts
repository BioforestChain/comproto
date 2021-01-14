import type { Comproto } from '../Comproto';
import ArrayParseHandler from './ArrayParseHandler';
import BigIntParseHandler from './BigIntParseHandler';
import MapParseHandler from './MapParseHandler';
import NumberParseHandler from './NumberParseHandler';
import ObjectParseHandler from './ObjectParseHandler';
import SetParseHandler from './SetParseHandler';
import StringParseHandler from './StringParseHandler';
import UndefinedgParseHandler from './UndefinedParseHandler';
import NullParseHandler from './NullParseHandler';
import BooleanParseHandler from './BooleanParseHandler';
import ExtParseHandler from './ExtParseHandler';
import BufferViewParseHandler from './BufferViewParseHandler';


export const initDataParse = (comproto: Comproto) => {
    new ArrayParseHandler(comproto);
    new BigIntParseHandler(comproto);
    new MapParseHandler(comproto);
    new NumberParseHandler(comproto);
    new ObjectParseHandler(comproto);
    new SetParseHandler(comproto);
    new StringParseHandler(comproto);
    new UndefinedgParseHandler(comproto);
    new NullParseHandler(comproto);
    new BooleanParseHandler(comproto);
    new ExtParseHandler(comproto);
    new BufferViewParseHandler(comproto);
    comproto.addClassHandler<typeof ArrayBuffer, Uint8Array>({
        handlerObj: ArrayBuffer,
        handlerName: '0x00',
        serialize(data) {
            return new Uint8Array(data);
        },
        deserialize(u8a) {
            return u8a.buffer;
        }
    });
    comproto.addClassHandler<typeof Set, unknown[]>({
        handlerObj: Set,
        handlerName: '0x02',
        serialize(data) {
            return [...data];
        },
        deserialize(dataArray) {
            return new Set(dataArray);
        }
    });
    comproto.addClassHandler<typeof RegExp, [string, (string | undefined)?]>({
        handlerObj: RegExp,
        handlerName: '0x03',
        serialize(data) {
            const value = RegExp.prototype.toString.call(data).split("/");
            value.shift();
            const out: [string, (string | undefined)?] = [value.pop() as string];
            out.unshift(value.join("/"));
            return out;
        },
        deserialize(value) {
            return RegExp.apply(null, value);
        }
    });
};
