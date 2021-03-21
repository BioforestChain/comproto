/// TEST

import { ComprotoFactory, bytesHelper } from "@bfchain/comproto";
import { benchmark, suite, FORMAT_MD, FORMAT_CSV } from "@thi.ng/bench";
const comproto = ComprotoFactory.getComproto();

// import x from 'ins'
import v8 from "v8";
import inspector from "inspector";
import util from "util";
import { writeFileSync } from "fs";
const session = new inspector.Session();
const profilerEnable = util.promisify((cb: (err: Error | null) => void) => {
  session.post("Profiler.enable", cb);
});
const profilerStart = util.promisify((cb: (err: Error | null) => void) => {
  session.post("Profiler.start", cb);
});
const profilerStop = util.promisify(
  (cb: (err: Error | null, params: inspector.Profiler.StopReturnType) => void) => {
    session.post("Profiler.stop", cb);
  },
);
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const enableProfile = !!process.env.PROFILE;

const obj = Array.from({ length: 10 }, () => ({
  asdasdads: "1",
  csacadsf: [{ asdasda: 15151423, xxx: true }],
}));

class O1 {
  constructor(public asdasdads = 666, public csacadsf = [new O2()]) {}
}
class O2 {
  constructor(public asdasda = 15151423, public xxx = true) {}
}
comproto.addClassHandler(
  {
    classCtor: O1,
    handlerName: "o1",
  },
  (obj) => {
    return [obj.asdasdads, ...obj.csacadsf] as const;
  },
  ([num, ...o2s]) => {
    return new O1(num, o2s.slice());
  },
);

comproto.addClassHandler(
  {
    classCtor: O2,
    handlerName: "o2",
  },
  (obj) => {
    return bytesHelper.writeInt32(obj.xxx ? 1 : 0, obj.asdasda);
  },
  (buf) => {
    return new O2(bytesHelper.readInt32({ buffer: buf, offset: 1 }), buf[0] === 1);
  },
);

const obj2 = Array.from({ length: 10 }, () => new O1());
const obj3 = Array.from({ length: 20 }, () => new O2());

(async function test() {
  enableProfile && session.connect();
  enableProfile && (await profilerEnable());

  const TIMES = 1e4;
  const WARMUP = 10;

  enableProfile && (await profilerStart());

  const buf1 = comproto.serialize(obj);
  const buf2 = comproto.serialize(obj2);
  const buf3 = comproto.serialize(obj3);
  const buf4 = v8.serialize(obj);
  const json5 = JSON.stringify(obj);
  const buf6 = encoder.encode(JSON.stringify(obj));
  suite(
    [
      { title: "cp.se object", fn: () => comproto.serialize(obj) },
      { title: "cp.de object", fn: () => comproto.deserialize(buf1) },
      { title: "cp.se custom-object", fn: () => comproto.serialize(obj2) },
      { title: "cp.de custom-object", fn: () => comproto.deserialize(buf2) },
      { title: "cp.se custom-flat-object", fn: () => comproto.serialize(obj3) },
      { title: "cp.de custom-flat-object", fn: () => comproto.deserialize(buf3) },
      { title: "v8.serialize object", fn: () => v8.serialize(obj) },
      { title: "v8.deserialize object", fn: () => v8.deserialize(buf4) },
      { title: "json.stringify object", fn: () => JSON.stringify(obj) },
      { title: "json.parse object", fn: () => JSON.parse(json5) },
      { title: "json+buf object", fn: () => encoder.encode(JSON.stringify(obj)) },
      { title: " object object", fn: () => JSON.parse(decoder.decode(buf6)) },
    ],
    {
      iter: TIMES,
      warmup: WARMUP,
      format: FORMAT_MD,
      //   size: 1,
    },
  );
})();
