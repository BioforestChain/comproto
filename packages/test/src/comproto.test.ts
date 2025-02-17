import test from "ava";

import { ComprotoFactory } from "@bfchain/comproto";
const comproto = ComprotoFactory.getComproto();

// console.log(new Set([2]))
// console.log(comproto.serialize(new Set([2])))
// console.log(comproto.deserialize(comproto.serialize(new Set([2]))));

class A {
  constructor(a: number) {
    this.a = a;
  }
  public a = 0;
}

comproto.addClassHandler<A, number>({
  handlerName: "CLASS_HANDLER_A",
  classCtor: A,
  serialize(obj: A) {
    return obj.a;
  },
  deserialize(a: number) {
    return new A(a);
  },
});

test("test serialize class instalce of handler", async (t) => {
  class B {
    b = 1;
    add() {}
  }
  const b = new B();
  t.deepEqual(transfer(b), { b: 1 });
  comproto.addClassHandler({
    handlerName: "CLASS_HANDLER_B",
    classCtor: B,
    deserialize() {
      return new B();
    },
  });
  t.deepEqual(transfer(b), b);
  comproto.deleteHandler("CLASS_HANDLER_B");
});

test("test serialize promise with custom handler", async (t) => {
  const promise = new Promise((resolve) => {});
  comproto.addCustomHandler({
    handlerName: "promise_a",
    deserialize() {
      return promise;
    },
  });
  comproto.setHandlerMarker(promise, "promise_a");
  t.is(promise, transfer(promise));
  const a = { a: 1, pro: promise };
  t.deepEqual(a, transfer(a));
  comproto.deleteHandler("promise_a");
});

test("test serialize class instace with no deserialize", async (t) => {
  class B {
    public b: number | undefined;
    constructor(b?: number) {
      this.b = b;
    }
    add() {}
  }
  const b = new B(1);
  comproto.addClassHandler({
    handlerName: "CLASS_HANDLER_B",
    classCtor: B,
    serialize(b: B) {
      return b.b;
    },
  });
  t.is(transfer(b), 1);
  comproto.deleteHandler("CLASS_HANDLER_B");
});

test("test deserialize class instace with no serialize", async (t) => {
  class C {
    public b: number | null;
    constructor(b?: number) {
      this.b = b || null;
    }
    add() {}
  }
  const b = new C(1);
  const cHandler: BFChainComproto.TransferByClassHandler<typeof C, number | undefined> = {
    handlerName: "CLASS_HANDLER_C",
    classCtor: C,
    deserialize(b) {
      return new C(b);
    },
  };
  comproto.addClassHandler(cHandler);
  t.deepEqual(transfer(b), new C());
  comproto.deleteHandler("CLASS_HANDLER_C");
});

test("test deserialize same name class instace handler", async (t) => {
  class B {}
  t.throws(() => {
    comproto.addClassHandler({
      handlerName: "CLASS_HANDLER_A",
      classCtor: B,
    });
  });
  comproto.addClassHandler({
    handlerName: "CLASS_HANDLER_SAME_NAME",
    classCtor: B,
    deserialize() {
      return 1;
    },
  });
  const addFun = comproto.addClassHandler.bind(comproto, {
    handlerName: "CLASS_HANDLER_SAME_NAME",
    classCtor: B,
    deserialize() {
      return 2;
    },
  });
  t.throws(addFun);
  comproto.deleteHandler("CLASS_HANDLER_SAME_NAME");
  t.notThrows(addFun);
  t.is(2, transfer(new B()));
  comproto.deleteHandler("CLASS_HANDLER_SAME_NAME");
});

test("test deserialize same name custom handler", async (t) => {
  class B {}
  t.throws(() => {
    comproto.addCustomHandler({
      handlerName: "CLASS_HANDLER_A",
    });
  });
  comproto.addCustomHandler({
    handlerName: "CUSTOM_HANDLER_SAME_NAME",
    deserialize() {
      return 1;
    },
  });
  const addFun = comproto.addCustomHandler.bind(comproto, {
    handlerName: "CUSTOM_HANDLER_SAME_NAME",
    deserialize() {
      return 2;
    },
  });
  t.throws(addFun);
  comproto.deleteHandler("CUSTOM_HANDLER_SAME_NAME");
  t.notThrows(addFun);
  t.is(transfer(B), undefined);
  comproto.setHandlerMarker(B, "CUSTOM_HANDLER_SAME_NAME");
  t.is(transfer(B), 2);
  comproto.deleteHandler("CUSTOM_HANDLER_SAME_NAME");
});

test("test deserialize same name handler", async (t) => {
  class B {}
  t.throws(() => {
    comproto.addCheckerHandler({
      handlerName: "CLASS_HANDLER_A",
      canHandle(b) {
        return b === B;
      },
    });
  });
  comproto.addCheckerHandler({
    handlerName: "HANDLER_SAME_NAME",
    canHandle(b) {
      return b === B;
    },
    deserialize() {
      return 1;
    },
  });
  const addFun = comproto.addCheckerHandler.bind(comproto, {
    handlerName: "HANDLER_SAME_NAME",
    canHandle(b) {
      return b === B;
    },
    deserialize() {
      return 2;
    },
  });
  t.throws(addFun);
  comproto.deleteHandler("HANDLER_SAME_NAME");
  t.notThrows(addFun);
  t.is(transfer(B), 2);
  comproto.deleteHandler("HANDLER_SAME_NAME");
});

test("test serialize Set", async (t) => {
  const set = new Set(["a"]);
  const compareSet = transfer(set);
  t.deepEqual(set, compareSet);

  const set1 = new Set([new A(1), { a: { b: new A(3) } }, 3]);
  const compareSet2 = transfer(set1);
  t.deepEqual(set1, compareSet2);
});

test("test serialize Map", async (t) => {
  const map = new Map([["a", new A(1)]]);
  const compareMap = transfer(map);
  t.deepEqual(map, compareMap);
});

test("test handler", async (t) => {
  class B {
    public a = 1;
  }
  const b = new B();
  const bHandler: BFChainComproto.TransferByCheckerHandler<B, number> = {
    handlerName: "bHandler",
    canHandle(obj) {
      return obj instanceof B;
    },
    serialize(obj) {
      return obj.a;
    },
    deserialize(a: number) {
      return new B();
    },
  };
  comproto.addCheckerHandler(bHandler);
  t.deepEqual(transfer(b), b);
  comproto.deleteHandler("bHandler");
});

test("test set custom handler", async (t) => {
  class B {
    public a = 1;
  }
  const b = new B();
  comproto.addCustomHandler(
    {
      handlerName: "customHandler",
    },
    (obj: { b: B }) => {
      return obj.b.a;
    },
    (a) => {
      return "customHandler deserialize" + a;
    },
  );
  const a = { b };
  comproto.setHandlerMarker(a, "customHandler");
  const compareObj = transfer(a);
  t.is("customHandler deserialize1", compareObj);
});

test("test delete custom handler", async (t) => {
  const a = {};
  comproto.setHandlerMarker(a, "customHandler1");
  t.is(comproto.canHandle(a), false);
  comproto.addCustomHandler({
    handlerName: "customHandler1",
  });
  t.is(comproto.canHandle(a), true);
  comproto.deleteHandlerMarker(a);
  t.is(comproto.canHandle(a), false);
  comproto.deleteHandler("customHandler1");
});

// 递归
test("test deep serialize", async (t) => {
  class B {}
  comproto.addClassHandler(
    {
      handlerName: "b",
      classCtor: B,
    },
    (b) => {
      return new A(2);
    },
    (a) => {
      return a.a;
    },
  );
  t.deepEqual(transfer(new B()), 2);
});

function transfer(data: unknown) {
  return comproto.deserialize(comproto.serialize(data));
}

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
