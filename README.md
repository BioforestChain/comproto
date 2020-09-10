# comproto

> 本项目实现针对自由结构数据进行序列化和反序列化编码。
> 本质面向线程间的编解码协议
> 对 v8.serialize 和 v8.deserialize 进行扩展和补充，实现自定义对象的传递

```js
// example class handler
import { ComprotoFactroy } from '@bfchain/comproto'
class B {
    public c: number = 0;
    constructor(c: number) {
        this.c = c;
    }
}
const bHandler = {
    handlerObj: B,
    serialize(obj: B) {
        return obj.c;
    },
    deserialize(c: number) {
        return new B(c);
    }
};
const comproto = ComprotoFactroy.getComproto();
comproto.addClassHandler('CLASS_HANDLER_B', bHandler);
const serializeData = { a: 1, b: new B(6) };
const buffer = comproto.serialize(serializeData);
comproto.deserialize(buffer); // { a: 1, b: B { b: 6 } }
```

```js
// example handler
import { ComprotoFactroy } from '@bfchain/comproto'
class B {
    public c: number = 0;
    constructor(c: number) {
        this.c = c;
    }
}
const bHandler = {
    handlerObj: B,
    serialize() {
        return undefined;
    },
    deserialize() {
        return B;
    }
};
const comproto = ComprotoFactroy.getComproto();
comproto.addHandler('HANDLER_B', bHandler);
const serializeData = { a: 1, b: B };
const buffer = comproto.serialize(serializeData);
comproto.deserialize(buffer); // { a: 1, b: [class B] }
```

## Download

```
$ yarn add @bfchain/comproto
```

## API

### `comproto.serialize(data: any): Buffer`

> Returns data Buffer

 实现自由数据编码，返回自定义buffer

### `comproto.deserialize(buffer: Buffer): any`

> Returns data of serialize

对serialize编码出来的数据进行解码

### `comproto.addClassHandler(protoName: string, registerClass: AnyClass, handler: TransferHandler): void`

注册类，基于 new 出来的 instalce 数据，都将会进入 serialize 方法，实现自定义编码

### `comproto.addHandler(protoName: string, handlerObj: any, handler: TransferHandler): void`

添加 handler，如果数据跟handlerObj一致，都将会进入 serialize 方法，实现自定义编码

### `comproto.deleteClassHandler(protoName: string): void`

删除 classHandler

### `comproto.deleteHandler(protoName: string): void`

删除 handler

