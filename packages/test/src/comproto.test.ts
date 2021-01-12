// import test from "ava";


import { ComprotoFactroy } from "@bfchain/comproto";
const comproto = ComprotoFactroy.getComproto();

// test("test number of int", async (t) => {
  const trasferData = comproto.serialize({ a: { b: { c: 2, d: 'ee' } } });
  (globalThis as any).console.log('serialize buf', trasferData);
  const data = comproto.deserialize(trasferData);
  (globalThis as any).console.log('serialize data', data);
  // t.is(1, 1);
// });

// class A {
//   constructor(a: number) {
//     this.a = a;
//   }
//   public a = 0;
// }

// comproto.addClassHandler({
//   handlerName: "CLASS_HANDLER_A",
//   handlerObj: A,
//   serialize(obj: A) {
//     return obj.a;
//   },
//   deserialize(a: number) {
//     return new A(a);
//   },
// });

// test("test number of int", async (t) => {
//   const trasferData = transfer(1);
//   t.is(trasferData, 1);
// });

// test("test serialize NaN only", async (t) => {
//   t.deepEqual(transfer(NaN), NaN);
// });

// test("test serialize undefined only", async (t) => {
//   t.is(transfer(undefined), undefined);
// });

// test("test number of big int", async (t) => {
//   const numStr = "45345345345345354353543543534534";
//   const trasferData = transfer(BigInt(numStr)) as BigInt;
//   t.is(trasferData, BigInt(numStr));
// });

// test("test serialize null only", async (t) => {
//   t.is(transfer(null), null);
// });

// test("test serialize boolean only", async (t) => {
//   t.is(transfer(true), true);
//   t.is(transfer(false), false);
// });

// test("test serialize string only", async (t) => {
//   t.is(transfer("qaq"), "qaq");
// });

// test("test serialize float only", async (t) => {
//   t.is(transfer(0.123456), 0.123456);
// });

// test("test serialize big double only", async (t) => {
//   t.is(transfer(3.123456123456123456123456), 3.123456123456123456123456);
// });

// test("test serialize date", async (t) => {
//   const date = new Date();
//   t.deepEqual(transfer(date), date);
// });

// test("test deep object with class instance handler", async (t) => {
//   const data = {
//     a: 1,
//     b: "test string",
//     d: [1, 2, new A(3), { a: 1, b: new A(2) }],
//     e: {
//       a: new A(5),
//       d: { ff: 0 },
//     },
//     c: new A(1),
//     g: null,
//     h: NaN,
//     i: 0.1,
//     f: undefined,
//   };
//   t.deepEqual(data, transfer(data));
// });

// test("test serialize class instalce of handler", async (t) => {
//   class B {
//     b = 1;
//     add() {}
//   }
//   const b = new B();
//   t.deepEqual(transfer(b), { b: 1 });
//   comproto.addClassHandler({
//     handlerName: "CLASS_HANDLER_B",
//     handlerObj: B,
//     deserialize() {
//       return new B();
//     },
//   });
//   t.deepEqual(transfer(b), b);
//   comproto.deleteClassHandler("CLASS_HANDLER_B");
// });

// test("test serialize array", async (t) => {
//   const trasferData1 = transfer([1, 2, 3]) as number[];
//   t.deepEqual(trasferData1, [1, 2, 3]);

//   const trasferData2 = transfer([{ a: new A(2), b: 2 }, new A(1)]) as unknown[];
//   t.deepEqual(trasferData2, [{ a: new A(2), b: 2 }, new A(1)]);
// });

// test("test serialize promise with custom handler", async (t) => {
//   const promise = new Promise((resolve) => {});
//   comproto.addCustomHandler({
//     handlerName: "promise_a",
//     deserialize() {
//       return promise;
//     },
//   });
//   comproto.setHandlerMarker(promise, "promise_a");
//   t.is(promise, transfer(promise));
//   const a = { a: 1, pro: promise };
//   t.deepEqual(a, transfer(a));
//   comproto.deleteCustomHandler("promise_a");
// });

// test("test serialize proxy", async (t) => {
//   const proxy = new Proxy(
//     { a: 1 },
//     {
//       get(target: unknown, key: string) {
//         return 2;
//       },
//     },
//   );
//   const transferProxyBuf = comproto.serialize(proxy);
//   t.deepEqual(comproto.deserialize(transferProxyBuf), { a: 2 });

//   const proxy2 = new Proxy({ a: 1 }, {});
//   const transferProxyBuf2 = comproto.serialize(proxy2);
//   t.deepEqual(comproto.deserialize(transferProxyBuf2), { a: 1 });
// });

// // Symbol
// test("test serialize symbol", async (t) => {
//   const symbol = Symbol("test");
//   t.is(transfer(symbol), null);

//   const data = { [symbol]: 1 };
//   t.deepEqual(transfer(data), {});

//   const data2 = { a: symbol };
//   t.deepEqual(transfer(data2), { a: null });

//   const data3 = [symbol];
//   t.deepEqual(transfer(data3), [null]);
// });

// // Error
// test("test serialize Error", async (t) => {
//   const error = new Error("test error");
//   const transferError = transfer(error) as Error;
//   t.is(transferError.message, error.message);
//   t.is(transferError.name, error.name);
//   t.is(transferError.stack, error.stack);
//   t.deepEqual(error, transferError);
// });

// // RegExp
// test("test serialize RegExp", async (t) => {
//   const reg = /abc/;
//   const regCompare = /abc/;
//   t.deepEqual(transfer(reg), regCompare);
// });

// test("test serialize class instace with no deserialize", async (t) => {
//   class B {
//     public b: number | undefined;
//     constructor(b?: number) {
//       this.b = b;
//     }
//     add() {}
//   }
//   const b = new B(1);
//   comproto.addClassHandler({
//     handlerName: "CLASS_HANDLER_B",
//     handlerObj: B,
//     serialize(b: B) {
//       return b.b;
//     },
//   });
//   t.is(transfer(b), 1);
//   comproto.deleteClassHandler("CLASS_HANDLER_B");
// });

// test("test deserialize class instace with no serialize", async (t) => {
//   class C {
//     public b: number | null;
//     constructor(b?: number) {
//       this.b = b || null;
//     }
//     add() {}
//   }
//   const b = new C(1);
//   const cHandler: BFChainComproto.TransferClassHandler<
//     typeof C, number | undefined
//   > = {
//     handlerName: "CLASS_HANDLER_C",
//     handlerObj: C,
//     deserialize(b) {
//       return new C(b);
//     },
//   };
//   comproto.addClassHandler(cHandler);
//   t.deepEqual(transfer(b), new C());
//   comproto.deleteClassHandler("CLASS_HANDLER_C");
// });

// test("test deserialize same name class instace handler", async (t) => {
//   class B {}
//   t.throws(() => {
//     comproto.addClassHandler({
//       handlerName: "CLASS_HANDLER_A",
//       handlerObj: B,
//     });
//   });
//   comproto.addClassHandler({
//     handlerName: "CLASS_HANDLER_SAME_NAME",
//     handlerObj: B,
//     deserialize() {
//       return 1;
//     },
//   });
//   const addFun = comproto.addClassHandler.bind(comproto, {
//     handlerName: "CLASS_HANDLER_SAME_NAME",
//     handlerObj: B,
//     deserialize() {
//       return 2;
//     },
//   });
//   t.throws(addFun);
//   comproto.deleteClassHandler("CLASS_HANDLER_SAME_NAME");
//   t.notThrows(addFun);
//   t.is(2, transfer(new B()));
//   comproto.deleteClassHandler("CLASS_HANDLER_SAME_NAME");
// });

// test("test deserialize same name custom handler", async (t) => {
//   class B {}
//   t.throws(() => {
//     comproto.addCustomHandler({
//       handlerName: "CLASS_HANDLER_A",
//     });
//   });
//   comproto.addCustomHandler({
//     handlerName: "CUSTOM_HANDLER_SAME_NAME",
//     deserialize() {
//       return 1;
//     },
//   });
//   const addFun = comproto.addCustomHandler.bind(comproto, {
//     handlerName: "CUSTOM_HANDLER_SAME_NAME",
//     deserialize() {
//       return 2;
//     },
//   });
//   t.throws(addFun);
//   comproto.deleteCustomHandler("CUSTOM_HANDLER_SAME_NAME");
//   t.notThrows(addFun);
//   t.is(transfer(B), null);
//   comproto.setHandlerMarker(B, "CUSTOM_HANDLER_SAME_NAME");
//   t.is(transfer(B), 2);
//   comproto.deleteCustomHandler("CUSTOM_HANDLER_SAME_NAME");
// });

// test("test deserialize same name handler", async (t) => {
//   class B {}
//   t.throws(() => {
//     comproto.addHandler({
//       handlerName: "CLASS_HANDLER_A",
//       canHandle() {
//         return true;
//       },
//     });
//   });
//   comproto.addHandler({
//     handlerName: "HANDLER_SAME_NAME",
//     canHandle() {
//       return true;
//     },
//     deserialize() {
//       return 1;
//     },
//   });
//   const addFun = comproto.addHandler.bind(comproto, {
//     handlerName: "HANDLER_SAME_NAME",
//     canHandle() {
//       return true;
//     },
//     deserialize() {
//       return 2;
//     },
//   });
//   t.throws(addFun);
//   comproto.deleteHandler("HANDLER_SAME_NAME");
//   t.notThrows(addFun);
//   t.is(transfer(B), 2);
//   comproto.deleteHandler("HANDLER_SAME_NAME");
// });

// test("test serialize Set", async (t) => {
//   const set = new Set(["a"]);
//   const compareSet = transfer(set);
//   t.deepEqual(set, compareSet);

//   const set1 = new Set([new A(1), { a: { b: new A(3) } }, 3]);
//   const compareSet2 = transfer(set1);
//   t.deepEqual(set1, compareSet2);
// });

// test("test serialize Map", async (t) => {
//   const map = new Map([["a", new A(1)]]);
//   const compareMap = transfer(map);
//   t.deepEqual(map, compareMap);
// });

// test("test handler", async (t) => {
//   class B {
//     public a = 1;
//   }
//   const b = new B();
//   const bHandler: BFChainComproto.TransferHandler<
//   B, number
//   > = {
//     handlerName: "bHandler",
//     canHandle(obj) {
//       return obj instanceof B;
//     },
//     serialize(obj) {
//       return obj.a;
//     },
//     deserialize(a: number) {
//       return new B();
//     },
//   }
//   comproto.addHandler(bHandler);
//   t.deepEqual(transfer(b), b);
//   comproto.deleteHandler("bHandler");
// });

// test("test set custom handler", async (t) => {
//   class B {
//     public a = 1;
//   }
//   const b = new B();
//   const customHandler: BFChainComproto.TransferCustomHandler<
//   { b: B }, number, string
//   > = {
//     handlerName: "customHandler",
//     serialize(obj) {
//       return obj.b.a;
//     },
//     deserialize(a: number) {
//       return "customHandler deserialize" + a;
//     },
//   };
//   comproto.addCustomHandler(customHandler);
//   const a = { b };
//   comproto.setHandlerMarker(a, "customHandler");
//   const compareObj = transfer(a);
//   t.is("customHandler deserialize1", compareObj);
// });

// test("test delete custom handler", async (t) => {
//   const a = {};
//   comproto.setHandlerMarker(a, "customHandler1");
//   t.is(comproto.canHandle(a), false);
//   comproto.addCustomHandler({
//     handlerName: "customHandler1",
//   });
//   t.is(comproto.canHandle(a), true);
//   comproto.deleteHandlerMarker(a);
//   t.is(comproto.canHandle(a), false);
//   comproto.deleteCustomHandler("customHandler1");
// });

// function transfer(data: unknown) {
//   return comproto.deserialize(comproto.serialize(data));
// }

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
