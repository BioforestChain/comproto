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
    // TODO: error, typearray
};
