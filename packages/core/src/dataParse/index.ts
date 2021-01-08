import type { Comproto } from '../Comproto';
import ArrayParseHandler from './Array';
import BigIntParseHandler from './BigInt';
import MapParseHandler from './Map';
import NumberParseHandler from './Number';
import ObjectParseHandler from './Object';
import SetParseHandler from './Set';
import StringParseHandler from './String';


export const initDataParse = (comproto: Comproto) => {
    comproto.setTypeHandler(ArrayParseHandler);
    comproto.setTypeHandler(BigIntParseHandler);
    comproto.setTypeHandler(MapParseHandler);
    comproto.setTypeHandler(NumberParseHandler);
    comproto.setTypeHandler(ObjectParseHandler);
    comproto.setTypeHandler(SetParseHandler);
    comproto.setTypeHandler(StringParseHandler);
};
