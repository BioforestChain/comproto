import test from 'ava';

import _ from 'lodash';
import Comporoto from '@bfchain/comproto';
const comproto  = new Comporoto();

class A {
    constructor(a: number) {
        this.a = a;
    }
    public a = 0;
    private d = '2';
}


test.beforeEach(() => {
    comproto.addClassHandler('CLASS_HANDLER_A', A, {
        encode(obj: A) {
            return obj.a;
        },
        decode(a: number) {
            return new A(a);
        },
    });
});

test('test number of int', async (t) => {
    const dataBuf = comproto.encode(1);
    const trasferData = comproto.decode(dataBuf) as number;
    t.is(trasferData, 1);
});

test('test number of big int', async (t) => {
    const dataBuf = comproto.encode(BigInt(45345345345345354353543543534534));
    const trasferData = comproto.decode(dataBuf) as BigInt;
    t.is(trasferData, BigInt(45345345345345354353543543534534));
});

test('test encode undefined only', async (t) => {
    t.is(comproto.decode(comproto.encode(undefined)), undefined);
});

test('test encode null only', async (t) => {
    t.is(comproto.decode(comproto.encode(null)), null);
});

test('test encode boolean only', async (t) => {
    t.is(comproto.decode(comproto.encode(true)), true);
    t.is(comproto.decode(comproto.encode(false)), false);
});

test('test encode string only', async (t) => {
    t.is(comproto.decode(comproto.encode('qaq')), 'qaq');
});

test('test encode NaN only', async (t) => {
    t.is(isNaN(comproto.decode(comproto.encode(NaN))), true);
});

test('test encode float only', async (t) => {
    t.is(comproto.decode(comproto.encode(0.123456)), 0.123456);
});

test('test encode big double only', async (t) => {
    t.is(comproto.decode(comproto.encode(3.123456123456123456123456)),3.123456123456123456123456);
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
    const dataBuf = comproto.encode(data);
    const trasferData = comproto.decode(dataBuf);
    t.is(_.isEqual(data, trasferData), true);
});

test('test encode class instalce of handler', async (t) => {
    class B { b = 1; add() {} }
    const b = new B();
    t.is(_.isEqual(comproto.decode(comproto.encode(b)), { b: 1}), true);
    t.is(_.isEqual(comproto.decode(comproto.encode(b)), b), false);
    comproto.addClassHandler('CLASS_HANDLER_B', B, {
        encode() {}, decode() { return new B() },
    });
    t.is(_.isEqual(comproto.decode(comproto.encode(b)), { b: 1}), false);
    t.is(_.isEqual(comproto.decode(comproto.encode(b)), b), true);
    comproto.deleteClassHandler('CLASS_HANDLER_B');
});

test('test encode class of handler', async (t) => {
    class B {
    }
    t.throws(comproto.encode.bind(comproto, B));
    comproto.addHandler('class_b', B, { encode() {}, decode() { return B; } });
    t.notThrows(comproto.encode.bind(comproto, B));
    const dataBuf = comproto.encode(B);
    const transferClass = comproto.decode(dataBuf) as B;
    t.is(transferClass, B);
    comproto.deleteHandler('class_b');
});

test('test encode array', async (t) => {
    const trasferData1 = comproto.decode(comproto.encode([1, 2, 3])) as number[];
    t.is(_.isEqual(trasferData1, [1, 2, 3]), true);

    const trasferData2 = comproto.decode(comproto.encode([{ a: new A(2), b: 2 }, new A(1)])) as any[];
    t.is(_.isEqual(trasferData2, [{ a: new A(2), b: 2 }, new A(1)]), true);
});

test('test encode function', async (t) => {
    function a() {}
    t.throws(comproto.encode.bind(comproto, a));
    comproto.addHandler('function_a', a, { encode() {}, decode() { return a; } });
    t.notThrows(comproto.encode.bind(comproto, a));
    const dataBuf = comproto.encode(a);
    const transferFunction = comproto.decode(dataBuf) as () => void;
    t.is(transferFunction, a);
    comproto.deleteHandler('function_a');
});

test('test encode promise', async (t) => {
    const promise = new Promise(resolve => {});
    t.throws(comproto.encode.bind(comproto, promise));
    comproto.addHandler('promise_a', promise, { encode() {}, decode() { return promise; } });
    t.notThrows(comproto.encode.bind(comproto, promise));
    const dataBuf = comproto.encode(promise);
    const transferPromise = comproto.decode(dataBuf) as Promise<any>;
    t.is(transferPromise, promise);
    comproto.deleteHandler('promise_a');
});

test('test encode proxy', async (t) => {
    const proxy = new Proxy({a: 1}, { get(target: any, key: string) {
        return 2;
    } });
    const transferProxyBuf = comproto.encode(proxy);
    t.is(_.isEqual(comproto.decode(transferProxyBuf), {a: 2}), true);

    const proxy2 = new Proxy({a: 1}, {});
    const transferProxyBuf2 = comproto.encode(proxy2);
    t.is(_.isEqual(comproto.decode(transferProxyBuf2), {a: 1}), true);

    const proxy3 = new Proxy({a: 1}, { get(target: any, key: string) {
        return target[key];
    } });
    const transferProxyBuf3 = comproto.encode(proxy3);
    t.is(_.isEqual(comproto.decode(transferProxyBuf3), {a: 1}), true);
    comproto.addHandler('proxy_a', proxy3, { encode() {}, decode() { return proxy3; } });
    const dataBuf = comproto.encode(proxy3);
    const transferProxy = comproto.decode(dataBuf) as Object;
    t.is(_.isEqual(transferProxy, proxy3), true);
    comproto.deleteHandler('proxy_a');
});

// Map
test('test encode map', async (t) => {
    const map = new Map([ ['a', 'string'], [ 'key', 'value' ] ]);
    const mapCompare = new Map([ ['a', 'string'], [ 'key', 'value' ] ]);
    const transMapBuf = comproto.encode(map);
    t.is(_.isEqual(comproto.decode(transMapBuf), mapCompare), true);
});

// Set
test('test encode set', async (t) => {
    const set = new Set([1, 2, 3, 4, 5]);
    const transMapBuf = comproto.encode(set);
    t.is(_.isEqual(comproto.decode(transMapBuf), new Set([1, 2, 3, 4, 5])), true);
});

// Symbol
test('test encode symbol', async (t) => {
    const symbol = Symbol('test');
    t.throws(comproto.encode.bind(comproto, symbol));
});

// Error
test('test encode Error', async (t) => {
    const error = new Error('test error');
    const errorCompare = new Error('test error');
    t.is(_.isEqual(comproto.decode(comproto.encode(error)), errorCompare), true);
});

// RegExp
test('test encode RegExp', async (t) => {
    const reg = /abc/;
    const regCompare = /abc/;
    t.is(_.isEqual(comproto.decode(comproto.encode(reg)), regCompare), true);
});

test('test encode class instace with no decode', async (t) => {
    class B {
        public b: number | undefined;
        constructor(b?: number) {
            this.b = b;
        }
        add() {}
    }
    const b = new B(1);
    comproto.addClassHandler('CLASS_HANDLER_B', B, {
        encode(b: B) { return b.b; }, decode() { },
    });
    t.is(comproto.decode(comproto.encode(b)), undefined);
    comproto.deleteClassHandler('CLASS_HANDLER_B');
});

// 有解码无编码
test('test decode class instace with no encode', async (t) => {
    class C {
        public b: number | undefined;
        constructor(b?: number) {
            this.b = b;
        }
        add() {}
    }
    const b = new C(1);
    comproto.addClassHandler('CLASS_HANDLER_C', C, {
        encode() { }, decode(b: number) { return new C(b) },
    });
    t.is(_.isEqual(comproto.decode(comproto.encode(b)), b), false);
    t.is(_.isEqual(comproto.decode(comproto.encode(b)), new C()), true);
    comproto.deleteClassHandler('CLASS_HANDLER_C');
});

