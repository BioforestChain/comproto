import test from 'ava';

import { Comproto } from '@bfchain/comproto';
import v8 from 'v8';
import msgpack from 'msgpack-lite';
const comproto  = new Comproto();

class A {
    constructor(a: number) {
        this.a = a;
    }
    public a = 0;
    private d = '2';
}


test.beforeEach(() => {
    comproto.addClassHandler('CLASS_HANDLER_A', {
        handlerObj: A,
        serialize(obj: A) {
            return obj.a;
        },
        deserialize(a: number) {
            return new A(a);
        },
    });
});


test('test number of int', async (t) => {
    const dataBuf = comproto.serialize(1);
    const trasferData = comproto.deserialize(dataBuf) as number;
    t.is(trasferData, 1);
});

test('test serialize NaN only', async (t) => {
    t.deepEqual(comproto.deserialize(comproto.serialize(NaN)), NaN);
});

test('test serialize undefined only', async (t) => {
    t.is(comproto.deserialize(comproto.serialize(undefined)), undefined);
});

test('test number of big int', async (t) => {
    const dataBuf = comproto.serialize(BigInt(45345345345345354353543543534534));
    const trasferData = comproto.deserialize(dataBuf) as BigInt;
    t.is(trasferData, BigInt(45345345345345354353543543534534));
});

test('test serialize null only', async (t) => {
    t.is(comproto.deserialize(comproto.serialize(null)), null);
});

test('test serialize boolean only', async (t) => {
    t.is(comproto.deserialize(comproto.serialize(true)), true);
    t.is(comproto.deserialize(comproto.serialize(false)), false);
});

test('test serialize string only', async (t) => {
    t.is(comproto.deserialize(comproto.serialize('qaq')), 'qaq');
});

test('test serialize float only', async (t) => {
    t.is(comproto.deserialize(comproto.serialize(0.123456)), 0.123456);
});

test('test serialize big double only', async (t) => {
    t.is(comproto.deserialize(comproto.serialize(3.123456123456123456123456)),3.123456123456123456123456);
});

test('test deep object with class instance handler', async (t) => {
    const data = {
        a: 1,
        b: 'test string',
        d: [1, 2, new A(3), { a: 1, b: new A(2) }],
        e: {
            a: new A(5),
            d: { ff: 0 },
        },
        c: new A(1),
        g: null,
        h: NaN,
        i: 0.1,
        f: undefined,
    };
    const dataBuf = comproto.serialize(data);
    const trasferData = comproto.deserialize(dataBuf);
    t.deepEqual(data, trasferData);
});

test('test serialize class instalce of handler', async (t) => {
    class B { b = 1; add() {} }
    const b = new B();
    t.deepEqual(comproto.deserialize(comproto.serialize(b)), { b: 1});
    comproto.addClassHandler('CLASS_HANDLER_B', {
        handlerObj: B,
        serialize() {}, deserialize() { return new B() },
    });
    t.deepEqual(comproto.deserialize(comproto.serialize(b)), b);
    comproto.deleteClassHandler('CLASS_HANDLER_B');
});

test('test serialize class of handler', async (t) => {
    class B {
    }
    comproto.addHandler('class_b', { handlerObj: B, serialize() {}, deserialize() { return B; } });
    t.notThrows(comproto.serialize.bind(comproto, B));
    const dataBuf = comproto.serialize(B);
    const transferClass = comproto.deserialize(dataBuf) as B;
    t.is(transferClass, B);
    comproto.deleteHandler('class_b');
});

test('test serialize array', async (t) => {
    const trasferData1 = comproto.deserialize(comproto.serialize([1, 2, 3])) as number[];
    t.deepEqual(trasferData1, [1, 2, 3]);

    const trasferData2 = comproto.deserialize(comproto.serialize([{ a: new A(2), b: 2 }, new A(1)])) as any[];
    t.deepEqual(trasferData2, [{ a: new A(2), b: 2 }, new A(1)]);
});

test('test serialize function', async (t) => {
    function a() {}
    comproto.addHandler('function_a', { handlerObj: a, serialize() {}, deserialize() { return a; } });
    t.notThrows(comproto.serialize.bind(comproto, a));
    const dataBuf = comproto.serialize(a);
    const transferFunction = comproto.deserialize(dataBuf) as () => void;
    t.is(transferFunction, a);
    comproto.deleteHandler('function_a');
});

test('test serialize promise', async (t) => {
    const promise = new Promise(resolve => {});
    comproto.addHandler('promise_a', { handlerObj: promise, serialize() {}, deserialize() { return promise; } });
    t.notThrows(comproto.serialize.bind(comproto, promise));
    const dataBuf = comproto.serialize(promise);
    const transferPromise = comproto.deserialize(dataBuf) as Promise<any>;
    t.is(transferPromise, promise);
    comproto.deleteHandler('promise_a');
});

test('test serialize proxy', async (t) => {
    const proxy = new Proxy({a: 1}, { get(target: any, key: string) {
        return 2;
    } });
    const transferProxyBuf = comproto.serialize(proxy);
    t.deepEqual(comproto.deserialize(transferProxyBuf), {a: 2});

    const proxy2 = new Proxy({a: 1}, {});
    const transferProxyBuf2 = comproto.serialize(proxy2);
    t.deepEqual(comproto.deserialize(transferProxyBuf2), {a: 1});

    const proxy3 = new Proxy({a: 1}, { get(target: any, key: string) {
        return target[key];
    } });
    const transferProxyBuf3 = comproto.serialize(proxy3);
    t.deepEqual(comproto.deserialize(transferProxyBuf3), {a: 1});
    comproto.addHandler('proxy_a', { handlerObj: proxy3, serialize() {}, deserialize() { return proxy3; } });
    const dataBuf = comproto.serialize(proxy3);
    const transferProxy = comproto.deserialize(dataBuf) as Object;
    t.deepEqual(transferProxy, proxy3);
    comproto.deleteHandler('proxy_a');
});

// Symbol
test('test serialize symbol', async (t) => {
    const symbol = Symbol('test');
    t.is(comproto.deserialize(comproto.serialize(symbol)), null);

    const data = { [symbol]: 1 };
    t.deepEqual(comproto.deserialize(comproto.serialize(data)), {});
});

// Error
test('test serialize Error', async (t) => {
    const error = new Error('test error');
    const transferError = comproto.deserialize(comproto.serialize(error)) as Error;
    t.is(transferError.message, error.message);
    t.is(transferError.name, error.name);
    t.is(transferError.stack, error.stack);
});

// RegExp
test('test serialize RegExp', async (t) => {
    const reg = /abc/;
    const regCompare = /abc/;
    t.deepEqual(comproto.deserialize(comproto.serialize(reg)), regCompare);
});

test('test serialize class instace with no deserialize', async (t) => {
    class B {
        public b: number | undefined;
        constructor(b?: number) {
            this.b = b;
        }
        add() {}
    }
    const b = new B(1);
    comproto.addClassHandler('CLASS_HANDLER_B', {
        handlerObj: B,
        serialize(b: B) { return b.b; }, deserialize() { },
    });
    t.is(comproto.deserialize(comproto.serialize(b)), undefined);
    comproto.deleteClassHandler('CLASS_HANDLER_B');
});

test('test deserialize class instace with no serialize', async (t) => {
    class C {
        public b: number | null;
        constructor(b?: number) {
            this.b = b || null;
        }
        add() {}
    }
    const b = new C(1);
    comproto.addClassHandler('CLASS_HANDLER_C', {
        handlerObj: C,
        serialize() { }, deserialize(b: number) { return new C(b) },
    });
    t.deepEqual(comproto.deserialize(comproto.serialize(b)), new C());
    comproto.deleteClassHandler('CLASS_HANDLER_C');
});

test('test deserialize same name class instace handler', async (t) => {
    class B {
        public b: number | undefined;
        constructor(b?: number) {
            this.b = b;
        }
        add() {}
    }
    class C {
        public b: number | undefined;
        constructor(b?: number) {
            this.b = b;
        }
        add() {}
    }
    const b = new B(1);
    const c = new C(1);
    comproto.addClassHandler('CLASS_HANDLER_SAME_NAME', {
        handlerObj: B,
        serialize(obj: B) { return obj.b; }, deserialize(b: number) { return new B(b); },
    });
    comproto.addClassHandler('CLASS_HANDLER_SAME_NAME', {
        handlerObj: C,
        serialize(obj: C) { return obj.b; }, deserialize(b: number) { return new C(b) },
    });
    t.is(comproto.canHanlder(b), false);
    t.is(comproto.canHanlder(c), true);
    comproto.deleteClassHandler('CLASS_HANDLER_SAME_NAME');
    t.is(comproto.canHanlder(c), false);
});


test('test deserialize same name handler', async (t) => {
    class B {
        public b: number | undefined;
        constructor(b?: number) {
            this.b = b;
        }
        add() {}
    }
    class C {
        public b: number | undefined;
        constructor(b?: number) {
            this.b = b;
        }
        add() {}
    }
    comproto.addHandler('CLASS_HANDLER_SAME_NAME', {
        handlerObj: B,
        serialize() { return undefined; }, deserialize() { return B; },
    });
    comproto.addHandler('CLASS_HANDLER_SAME_NAME', {
        handlerObj: C,
        serialize() { return undefined; }, deserialize() { return C },
    });
    t.is(comproto.canHanlder(B), false);
    t.is(comproto.canHanlder(C), true);
    comproto.deleteHandler('CLASS_HANDLER_SAME_NAME');
    t.is(comproto.canHanlder(C), false);
});

// Set
test('test serialize Set', async (t) => {
    const set = new Set(['a']);
    const compareSet = comproto.deserialize(comproto.serialize(set));
    t.deepEqual(set, compareSet);

    const set1 = new Set([new A(1)]);
    const compareSet2 = comproto.deserialize(comproto.serialize(set1));
    t.deepEqual(set1, compareSet2);
});

// Map
test('test serialize Map', async (t) => {
    const map = new Map([ ['a', new A(1)] ]);
    const compareMap = comproto.deserialize(comproto.serialize(map));
    t.deepEqual(map, compareMap);
});


/***
 *  v8 vs comproto
 *  encode : 1 vs 10
 *  decode : 1 vs 3
 * 
 * msgpack vs v8 vs comproto
 * encode : 1 : 3 : 10
 * decode : 1 : 0.6 : 2
*/
// test('test xiao lv', async (t) => {
//     // const data = new Map([ ['a', new A(1)] ]);
//     const data = {
//         a: 1,
//         b: 'test string',
//         // d: [1, 2, new A(3), { a: 1, b: new A(2) }],
//         e: {
//             // a: new A(5),
//             d: { ff: 0 },
//         },
//         // c: new A(1),
//         g: null,
//         h: NaN,
//         i: 0.1,
//         f: undefined,
//     };
//     const count = 10000;
//     const b1 = comproto.serialize(data);
//     const b2 = v8.serialize(data);
//     const b3 = msgpack.encode(data);
//     console.time('comproto encode');
//     for(let i = 0; i < count; i ++) {
//         comproto.serialize(data)
//     }
//     console.timeEnd('comproto encode');
//     console.time('comproto decode');
//     for(let i = 0; i < count; i ++) {
//         comproto.deserialize(b1)
//     }
//     console.timeEnd('comproto decode');
//     console.time('v8 encode');
//     for(let i = 0; i < count; i ++) {
//         v8.serialize(data)
//     }
//     console.timeEnd('v8 encode');
//     console.time('v8 decode');
//     for(let i = 0; i < count; i ++) {
//         v8.deserialize(b2);
//     }
//     console.timeEnd('v8 decode');

//     console.time('msgpack encode');
//     for(let i = 0; i < count; i ++) {
//         msgpack.encode(data)
//     }
//     console.timeEnd('msgpack encode');
//     console.time('msgpack decode');
//     for(let i = 0; i < count; i ++) {
//         msgpack.decode(b3)
//     }
//     console.timeEnd('msgpack decode');
//     t.pass();
// });