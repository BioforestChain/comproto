# comproto

> 本项目实现针对自由结构数据进行序列化和反序列化编码。
> 本质面向线程间的编解码协议
> 对 v8.serialize 和 v8.deserialize 进行扩展和补充，实现自定义对象的传递

```js
// example class handler
import { ComprotoFactory } from '@bfchain/comproto';
const comproto = ComprotoFactory.getSingleton();
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
// 或
comproto.addClassHandler<typeof B, number>({
    handlerName: 'CLASS_HANDLER_B',
    handlerObj: B,
    serialize(obj) {
        return obj.c;
    },
    deserialize(c) {
        return new B(c);
    }
});
comproto.addClassHandler(bHandler);
const serializeData = { a: 1, b: new B(6) };
const buffer = comproto.serialize(serializeData);
comproto.deserialize(buffer); // { a: 1, b: B { b: 6 } }
```

```js
import { ComprotoFactory } from '@bfchain/comproto';
const comproto = ComprotoFactory.getSingleton();
class B {
    public c: number = 0;
    constructor(c: number) {
        this.c = c;
    }
}
comproto.setHandlerMarker(B, 'HANDLER_B');
comproto.addCustomHandler({
    handlerName: 'HANDLER_B',
    deserialize() {
        return B;
    }
});
const serializeData = { a: 1, b: B };
const buffer = comproto.serialize(serializeData);
comproto.deserialize(buffer); // { a: 1, b: [class B] }
```

```js
import { ComprotoFactory } from '@bfchain/comproto';
const comproto = ComprotoFactory.getSingleton();
class B {
    public c: number = 0;
    constructor(c: number) {
        this.c = c;
    }
}
comproto.addHandler<typeof B>({
    handlerName: 'HANDLER_B',
    canHandle(b) {
        return b instanceof B;
    },
    deserialize() {
        return B;
    }
});
const serializeData = { a: 1, b: new B(3) };
const buffer = comproto.serialize(serializeData);
comproto.deserialize(buffer); // { a: 1, b: B { c: 3 } }
```

## Download

```
$ yarn add @bfchain/comproto
```

## API

### `ComprotoFactory.getSingleton(): Comproto`

> 返回 Comproto 单例，全局公用一个

### `ComprotoFactory.getComproto(): Comproto`

> 返回 Comproto 的一个普通实例

### `comproto.serialize(data: unknown): BFChainComproto.ComprotoBuffer`

> Returns data Buffer

实现自由数据编码，返回自定义 buffer

### `comproto.deserialize(buffer: BFChainComproto.ComprotoBuffer): unknown`

> Returns data of serialize

对 serialize 编码出来的数据进行解码

### `comproto.addClassHandler(handler: TransferClassHandler): void`

注册类，基于 new 出来的 instalce 数据，都将会进入 serialize 方法，实现自定义编码

### `comproto.deleteClassHandler(handlerName: string): void`

删除 classHandler

### `comproto.addHandler(handler: TransferHandler): void`

添加 handler，如果数据能被 `canHandle` 处理并返回 `true`，都将会进入 serialize 方法，实现自定义编码

### `comproto.deleteHandler(handlerName: string): void`

删除 handler

### `comproto.addCustomHandler(handler: BFChainComproto.TransferCustomHandler): void`

添加自定义 handler, 配合 setHandlerMarker 使用

### `comproto.deleteCustomHandler(handlerName: string): void`

删除自定义 handler

### `comproto.setHandlerMarker(handlerObj: unknown, handlerName: string): void`

设置对象上的 handler 标记

### `comproto.deleteHandlerMarker(handlerObj: unknown): void`

删除对象上的 handler 标记

_ps:这里 comproto 在发布版本的时候会有一个奇怪的 bug，所以推荐的发布步骤为_

```bash
lerna publish --skip-git
等发布成功在手动 commit
```
