# comproto

> 本项目实现针对自由结构数据进行序列化和反序列化编码。
> 本质面向线程间的编解码协议
> 对 v8.serialize 和 v8.deserialize 进行扩展和补充，实现自定义对象的传递

```js
// example
class B {
    public c: number = 0;
    constructor(c: number) {
        this.c = c;
    }
}
const bHandler = {
    encode(obj: B) {
        return obj.c;
    },
    decode(c: number) {
        return new B(c);
    }
};
const comproto = new Comproto();
comproto.addClassHandler('class_b', B, bHandler);
const encodeData = { a: 1, b: new B(6), c: { a: 1, d: { ww: 22 }, e: 'ee' } };
const buffer = comproto.encode(encodeData);
console.log(comproto.decode(buffer));
```

## Download

```
$ npm install --save @bfchain/comproto
```

## API

### `comproto.encode(data: any): UInt8Array`

> Returns data UInt8Array

 实现自由数据编码，返回自定义buffer

### `comproto.decode(buffer: UInt8Array): any`

> Returns data of encode

对encode编码出来的数据进行解码

### `comproto.addClassHandler(protoName: string, registerClass: AnyClass, handler: TransferHandler): void`

注册类，基于 new 出来的 instalce 数据，都将会进入 encode 方法，实现自定义编码

### `comproto.addHandler(protoName: string, handlerObj: any, handler: TransferHandler): void`

添加 handler，如果数据跟handlerObj一致，都将会进入 encode 方法，实现自定义编码

### `comproto.deleteClassHandler(protoName: string): void`

删除 classHandler

### `comproto.deleteHandler(protoName: string): void`

删除 handler

