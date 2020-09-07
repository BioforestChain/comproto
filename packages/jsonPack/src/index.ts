import "@bfchain/comproto-typings";

import msgPack from 'msgpack-lite';

export const pack = (data: any): BFChainComproto.ComprotoBuffer => {
    return msgPack.encode(data);
};

export const unpack = (buffer: BFChainComproto.ComprotoBuffer) => {
    return msgPack.decode(buffer as Buffer);
};
