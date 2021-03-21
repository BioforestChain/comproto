/// TEST

import { ComprotoFactory, bytesHelper } from "@bfchain/comproto";
import * as path from "path";
import * as fs from "fs";
import { add, complete, cycle, suite, save } from "benny";
const comproto = ComprotoFactory.getComproto();

// import x from 'ins'
import v8 from "v8";
import inspector from "inspector";
import util from "util";
import { fstat, writeFileSync } from "fs";

const session = new inspector.Session();
const profilerEnable = util.promisify((cb: (err: Error | null) => void) => {
  session.post("Profiler.enable", cb);
});
const profilerStart = util.promisify((cb: (err: Error | null) => void) => {
  session.post("Profiler.start", cb);
});
const profilerStop = util.promisify((cb: (err: Error | null, params: inspector.Profiler.StopReturnType) => void) => {
  session.post("Profiler.stop", cb);
});
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

  const buf1 = comproto.serialize(obj);
  const buf2 = comproto.serialize(obj2);
  const buf3 = comproto.serialize(obj3);
  const buf4 = v8.serialize(obj);
  const json5 = JSON.stringify(obj);
  const buf6 = encoder.encode(JSON.stringify(obj));
  const benchList = [
    { group: "comproto", title: "comproto.serialize object", fn: () => comproto.serialize(obj) },
    {
      group: "comproto",
      title: "comproto.deserialize object",
      fn: () => comproto.deserialize(buf1),
    },
    {
      group: "comproto",
      title: "comproto.serialize custom-object",
      fn: () => comproto.serialize(obj2),
    },
    {
      group: "comproto",
      title: "comproto.deserialize custom-object",
      fn: () => comproto.deserialize(buf2),
    },
    {
      group: "comproto",
      title: "comproto.serialize custom-flat-object",
      fn: () => comproto.serialize(obj3),
    },
    {
      group: "comproto",
      title: "comproto.deserialize custom-flat-object",
      fn: () => comproto.deserialize(buf3),
    },
    { group: "v8", title: "v8.serialize object", fn: () => v8.serialize(obj) },
    { group: "v8", title: "v8.deserialize object", fn: () => v8.deserialize(buf4) },
    { group: "json", title: "json.stringify object", fn: () => JSON.stringify(obj) },
    { group: "json", title: "json.parse object", fn: () => JSON.parse(json5) },
    {
      group: "comproto",
      title: "buf.stringify object",
      fn: () => encoder.encode(JSON.stringify(obj)),
    },
    { group: "comproto", title: "buf.parse object", fn: () => JSON.parse(decoder.decode(buf6)) },
  ];
  //   suite(benchList, {
  //     iter: TIMES,
  //     warmup: WARMUP,
  //     format: FORMAT_MD,
  //     //   size: 1,
  //   });

  //   const bench = new Bench().group("xxx");
  //   for (const item of benchList) {
  //     bench.add(item.title, item.fn);
  //   }
  //   bench.run();

  const benchmarkResultFolder = path.resolve(__dirname, "../../../../benchmark");
  const benchmarkResultFile = "serialize-deserialize";

  enableProfile && (await profilerEnable());

  enableProfile && (await profilerStart());

  await suite(
    "Serialize and Deserialize",
    ...benchList.map((item) => add(item.title, item.fn)),
    ///
    cycle(),
    complete(),
    save({ file: benchmarkResultFile, folder: benchmarkResultFolder, format: "chart.html" }),
  );

  if (enableProfile) {
    const { profile } = await profilerStop();
    fs.writeFileSync(path.join(benchmarkResultFolder, `profile-${new Date().toISOString()}.json`), JSON.stringify(profile));
  }
  enableProfile && (await profilerStop());

  const chartFilepath = path.join(benchmarkResultFolder, benchmarkResultFile + ".chart.html");
  fs.writeFileSync(chartFilepath, fs.readFileSync(chartFilepath, "utf-8").replace("https://cdn.jsdelivr.net/npm/chart.js@2.8.0/dist", "lib"));
})();
