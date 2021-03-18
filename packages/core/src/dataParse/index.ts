import type { Comproto } from "../Comproto";
import ArrayParseHandler from "./ArrayParseHandler";
import BigIntParseHandler from "./BigIntParseHandler";
import MapParseHandler from "./MapParseHandler";
import NumberParseHandler from "./NumberParseHandler";
import ObjectParseHandler from "./ObjectParseHandler";
import StringParseHandler from "./StringParseHandler";
import UndefinedgParseHandler from "./UndefinedParseHandler";
import NullParseHandler from "./NullParseHandler";
import BooleanParseHandler from "./BooleanParseHandler";
import ExtParseHandler from "./ExtParseHandler";
import BufferViewParseHandler from "./BufferViewParseHandler";
import ArrayBufferParseHandler from "./ArrayBufferParseHandler";

export const initDataParse = (comproto: Comproto) => {
  new ArrayParseHandler(comproto);
  new BigIntParseHandler(comproto);
  new MapParseHandler(comproto);
  new NumberParseHandler(comproto);
  new ObjectParseHandler(comproto);
  new StringParseHandler(comproto);
  new UndefinedgParseHandler(comproto);
  new NullParseHandler(comproto);
  new BooleanParseHandler(comproto);
  new ExtParseHandler(comproto);
  new BufferViewParseHandler(comproto);
  new ArrayBufferParseHandler(comproto);

  comproto.addClassHandler<typeof Set, unknown[]>({
    handlerObj: Set,
    handlerName: "0x02",
    serialize(data) {
      return [...data];
    },
    deserialize(dataArray) {
      return new Set(dataArray);
    },
  });
  comproto.addClassHandler<typeof RegExp, [string, (string | undefined)?]>({
    handlerObj: RegExp,
    handlerName: "0x03",
    serialize(data) {
      const value = RegExp.prototype.toString.call(data).split("/");
      value.shift();
      const out: [string, (string | undefined)?] = [value.pop() as string];
      out.unshift(value.join("/"));
      return out;
    },
    deserialize(value) {
      return RegExp.apply(null, value);
    },
  });
  comproto.addClassHandler<typeof Date, number>({
    handlerObj: Date,
    handlerName: "0x04",
    serialize(data) {
      return data.getTime();
    },
    deserialize(value) {
      return new Date(value);
    },
  });
  type errorHandlerObject = {
    name: string;
    message: string;
    stack: string | undefined;
  };
  const addErrorHandler = <T extends ErrorConstructor>(ErrorClass: T, tag: string) => {
    comproto.addClassHandler({
      handlerObj: ErrorClass,
      handlerName: tag,
      serialize(err) {
        return {
          name: err.name,
          message: err.message,
          stack: err.stack,
        };
      },
      deserialize(errorObject: errorHandlerObject) {
        const err = new ErrorClass();
        err.name = errorObject.name;
        err.message = errorObject.message;
        err.stack = errorObject.stack;
        return err;
      },
    });
  };
  addErrorHandler(Error, "0x05");
  addErrorHandler(EvalError, "0x06");
  addErrorHandler(RangeError, "0x07");
  addErrorHandler(ReferenceError, "0x08");
  addErrorHandler(SyntaxError, "0x09");
  addErrorHandler(TypeError, "0xa0");
  addErrorHandler(URIError, "0xa1");

  interface ArrayBufferViewConstructor {
    new (buffer: ArrayBufferLike, byteOffset?: number, byteLength?: number): ArrayBufferView;
  }
  const addBufferViewHandler = <T extends ArrayBufferViewConstructor>(abv: T, tag: string) => {
    comproto.addClassHandler({
      handlerObj: abv,
      handlerName: tag,
      serialize(buf) {
        return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      },
      deserialize(bufArr: ArrayBufferLike) {
        return new abv(bufArr);
      },
    });
  };
  addBufferViewHandler(Uint8Array, "0xa2");
  addBufferViewHandler(Int8Array, "0xa3");
  addBufferViewHandler(Int16Array, "0xa4");
  addBufferViewHandler(Uint16Array, "0xa5");
  addBufferViewHandler(Int32Array, "0xa6");
  addBufferViewHandler(Uint32Array, "0xa7");
  addBufferViewHandler(Float32Array, "0xa8");
  addBufferViewHandler(Float64Array, "0xa9");
  addBufferViewHandler(Uint8ClampedArray, "0xb1");
  addBufferViewHandler(BigInt64Array, "0xb2");
  addBufferViewHandler(BigUint64Array, "0xb3");
};
