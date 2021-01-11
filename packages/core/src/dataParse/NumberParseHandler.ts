import { dataTypeEnum } from '../const';
import type { Comproto } from '../Comproto';
import BaseParseHandler from './BaseParseHandler';
export default class NumberParseHandler
    extends BaseParseHandler
    implements BFChainComproto.typeTransferHandler<typeof Number> {
    constructor(comproto: Comproto) {
        super();
        comproto.setTypeHandler(this);
    }
    typeName = dataTypeEnum.Number;
    typeClass = Number;
    serialize(data: Number, comproto: Comproto) {
//   token[0xd0] = format.int8;
//   token[0xd1] = format.int16;
//   token[0xd2] = format.int32;
//   token[0xd3] = format.int64;

        return new Uint8Array();
    }
    deserialize(buf: Uint8Array) {
        return 1;
    }
    write1(type: number, val: number) {
        return new Uint8Array([type, value])
    }
    getTag(value: number) {
        const ivalue = value | 0;
        var type;
        if (value !== ivalue) {
            // float 64 -- 0xcb
            type = 0xcb;
            return  this.writeN(0xcb, 8, (Buffer_prototype.writeDoubleBE || writeDoubleBE), true);;
        } else if (-0x20 <= ivalue && ivalue <= 0x7F) {
            // positive fixint -- 0x00 - 0x7f
            // negative fixint -- 0xe0 - 0xff
            type = ivalue & 0xFF;
        } else if (0 <= ivalue) {
            // uint 8 -- 0xcc
            // uint 16 -- 0xcd
            // uint 32 -- 0xce
            type = (ivalue <= 0xFF) ? 0xcc : (ivalue <= 0xFFFF) ? 0xcd : 0xce;
        } else {
            // int 8 -- 0xd0
            // int 16 -- 0xd1
            // int 32 -- 0xd2
            type = (-0x80 <= ivalue) ? 0xd0 : (-0x8000 <= ivalue) ? 0xd1 : 0xd2;
        }
    }
}

