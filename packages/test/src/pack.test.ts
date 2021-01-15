import test from "ava";

import { ComprotoFactroy } from "@bfchain/comproto";
const comproto = ComprotoFactroy.getComproto();
import { BBuffer } from '@bfchain/util-buffer';


test("test number of int", async (t) => {
    const testNumArr = [
        -30, -31, -32, -33,
        -0x80 - 1, -0x80, -0x80 + 1,
        -0x8000 - 1, -0x8000, -0x8000 + 1,
        -126, -127, -128, -255, -256, -257,
         0, 126, 127, 128, 255, 256, 257,
        0xffff - 1, 0xffff, 0xffff + 1,
        0xFFFFFF - 1, 0xFFFFFF, 0xFFFFFF,
        Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER,
        Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY,
        Number.MAX_VALUE, Number.MIN_VALUE,
    ];
    testNumArr.forEach(item => {
        const trasferData = transfer(item);
        t.is(trasferData, item);
    });
    t.is(transfer(-0), 0);
});

test("test number of float", async (t) => {
    const testNumArr = [
        -0.1, -0.2, -0.00000000001, -3.222222223,
        0.1, 0.2, 0.00000000001, 3.222222223,
        Number.EPSILON,
    ];
    testNumArr.forEach(item => {
        const trasferData = transfer(item);
        t.is(trasferData, item);
    });
});

test("test number of other", async (t) => {
    const testNumArr = [
        Infinity, - Infinity,
        Number.NaN,
    ];
    testNumArr.forEach(item => {
        const trasferData = transfer(item);
        t.is(trasferData, item);
    });
});

test("test string", async (t) => {
    const createLenStr = (len: number) => {
        let str = '';
        for(let i = 0; i <= len; i ++) {
            str += 'a'
        }
        return str;
    };
    const testArr = [
        createLenStr(0), createLenStr(29), createLenStr(33),
        createLenStr(0xff - 1), createLenStr(0xff), createLenStr(0xff + 1),
        createLenStr(0xFFFF + 1),
    ];
    testArr.forEach(item => {
        const trasferData = transfer(item);
        t.is(trasferData, item);
    });
});

test("test undefined null", async (t) => {
    t.is(transfer(undefined), undefined);
    t.is(transfer(null), null);
});

test("test undefined boolean", async (t) => {
    t.is(transfer(true), true);
    t.is(transfer(false), false);
});

test("test bigint", async (t) => {
    t.is(transfer(BigInt(1)), BigInt(1));
    t.is(transfer(BigInt(Number.MAX_VALUE + 1)), BigInt(Number.MAX_VALUE + 1));
});

test("test array", async (t) => {
    t.deepEqual(transfer([]), []);
    t.deepEqual(transfer([1]), [1]);
    t.deepEqual(transfer(['', { a : 'ss' }]), ['', { a: 'ss' }]);
    t.deepEqual(transfer([{ a: 1, b: '3', c: { e: [ 1, { b: BigInt(1) } ] } }]), [{ a: 1, b: '3', c: { e: [ 1, { b: BigInt(1) } ] } }]);
});

test("test object", async (t) => {
    t.deepEqual(transfer({}), {});
    t.deepEqual(transfer({ a: 2, b: [34], c: { d: '' } }), { a: 2, b: [34], c: { d: '' } });
    // long length
    // const obj: any = {};
    // for(let i = 0; i < 16; i++) {
    //     obj[i] = i;
    // }
    // t.deepEqual(transfer(obj), obj);
    // const obj2: any = {};
    // for(let i = 0; i < 0xff; i++) {
    //     obj2[i] = i;
    // }
    // t.deepEqual(transfer(obj2), obj2);
    // const obj3: any = {};
    // for(let i = 0; i < 0xffff - 1; i++) {
    //     obj3[i] = i;
    // }
    // t.deepEqual(transfer(obj3), obj3);
    // const obj4: any = {};
    // for(let i = 0; i < 0xffff; i++) {
    //     obj4[i] = i;
    // }
    // t.deepEqual(transfer(obj4), obj4);
    // const obj5: any = {};
    // for(let i = 0; i < 0xffff + 1; i++) {
    //     obj5[i] = i;
    // }
    // t.deepEqual(transfer(obj5), obj5);
});

test("test map", async (t) => {
    t.deepEqual(transfer(new Map()), new Map());
    const aKey = { a: 1 };
    const map1 = new Map<unknown, unknown>([
        ['a', 1],
        ['b', { a: 2 }],
        [aKey, { a: 2, b: [] }],
    ]);
    t.deepEqual(transfer(map1), map1);
});

test("test set", async (t) => {
    t.deepEqual(transfer(new Set([1])), new Set([1]));
    // t.is(transfer(new Set([])), new Set([]));
});


test("test array buffer", async (t) => {
    t.deepEqual(transfer(new Uint8Array([1])), new Uint8Array([1]));
    t.deepEqual(transfer(new Uint16Array([1])), new Uint16Array([1]));
    t.deepEqual(transfer(new Uint16Array([1]).buffer), new Uint16Array([1]).buffer);
    // length
    t.deepEqual(new Uint8Array(0xff - 1), new Uint8Array(0xff - 1));
    t.deepEqual(new Uint8Array(0xff), new Uint8Array(0xff));
    t.deepEqual(new Uint8Array(0xff + 1), new Uint8Array(0xff + 1));

    t.deepEqual(new Uint32Array(0xffff - 1), new Uint32Array(0xffff - 1));
    t.deepEqual(new Uint32Array(0xffff), new Uint32Array(0xffff));
    t.deepEqual(new Uint32Array(0xffff + 1), new Uint32Array(0xffff + 1));
});

function transfer(data: unknown) {
  return comproto.deserialize(comproto.serialize(data));
}
