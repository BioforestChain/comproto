// if (value instanceof Object && valueType === "[object Object]" && !!value) {
    //   const obj: { [key: string]: unknown } = {};
    //   const val = value as { [key: string]: unknown };
    //   Object.keys(val)
    //     .sort()
    //     .forEach((attr: string) => {
    //       obj[attr] = this.serializeTransfer(val[attr], transferState);
    //     });
    //   return obj;
    // }

import { dataTypeEnum } from '../const';

export default {
    typeName: dataTypeEnum.Object,
    typeClass: Object,
    serialize(data, comproto) {
        return new Uint8Array();
    },
    deserialize(buf) {
        return {};
    },
} as BFChainComproto.typeTransferHandler<typeof Object>;