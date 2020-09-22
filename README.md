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
    handlerName: 'CLASS_HANDLER_B',
    handlerObj: B,
    serialize(obj: B) {
        return obj.c;
    },
    deserialize(c: number) {
        return new B(c);
    }
};
const comproto = ComprotoFactroy.getSingleton();
comproto.addClassHandler(bHandler);
const serializeData = { a: 1, b: new B(6) };
const buffer = comproto.serialize(serializeData);
comproto.deserialize(buffer); // { a: 1, b: B { b: 6 } }
```

```js
import { ComprotoFactroy } from '@bfchain/comproto'
class B {
    public c: number = 0;
    constructor(c: number) {
        this.c = c;
    }
}
const bHandler = {
    handlerName: 'HANDLER_B',
    handlerObj: B,
    deserialize() {
        return B;
    }
};
const comproto = ComprotoFactroy.getSingleton();
comproto.addProtoHandler(bHandler);
const serializeData = { a: 1, b: B };
const buffer = comproto.serialize(serializeData);
comproto.deserialize(buffer); // { a: 1, b: [class B] }
```

```js
import { ComprotoFactroy } from '@bfchain/comproto'
class B {
    public c: number = 0;
    constructor(c: number) {
        this.c = c;
    }
}
const bHandler = {
    handlerName: 'HANDLER_B',
    canHandle(b: any) {
        return b instanceof B;
    },
    deserialize() {
        return B;
    }
};
const comproto = ComprotoFactroy.getSingleton();
comproto.addHandler(bHandler);
const serializeData = { a: 1, b: new B(3) };
const buffer = comproto.serialize(serializeData);
comproto.deserialize(buffer); // { a: 1, b: B { c: 3 } }
```

## Download

```
$ yarn add @bfchain/comproto
```

## API

### `ComprotoFactroy.getSingleton(): Comproto`

> 返回 Comproto 单例，全局公用一个

### `ComprotoFactroy.getComproto(): Comproto`

> 返回 Comproto 的一个普通实例

### `comproto.serialize(data: any): Buffer`

> Returns data Buffer

 实现自由数据编码，返回自定义buffer

### `comproto.deserialize(buffer: Buffer): any`

> Returns data of serialize

对serialize编码出来的数据进行解码

### `comproto.addClassHandler(handler: TransferClassHandler): void`

注册类，基于 new 出来的 instalce 数据，都将会进入 serialize 方法，实现自定义编码

### `comproto.deleteClassHandler(handlerName: string): void`

删除 classHandler

### `comproto.addProtoHandler(handler: TransferProtoHandler): void`

添加 protoHandler，如果数据跟handlerObj一致，都将会进入 serialize 方法，实现自定义编码

### `comproto.deleteProtoHandler(handlerName: string): void`

删除 protoHandler

### `comproto.addHandler(handler: TransferHandler): void`

添加 handler，如果数据能被 `canHandle` 处理并返回 `true`，都将会进入 serialize 方法，实现自定义编码

### `comproto.deleteHandler(handlerName: string): void`

删除 handler

### `comproto.addCustomHandler(handler: BFChainComproto.TransferCustomHandler): void`

添加自定义 handler, 配合 setCustomHandler 使用

### `comproto.setCustomHandler(obj: any, handlerName: string): void`

设置对象自定义 handler key， 当处理此数据调用自定义 serailize。

### `comproto.deleteCustomHandler(handlerName?: string): void`

删除自定义 handler, 当 handlerName 不传默认删除所有

