let binary2Hex: (binary: Uint8Array, offset?: number, len?: number) => string;

const num2hexHasMap: { [u8: number]: string } = Object.create(null);
for (let i = 0; i < 256; i++) {
  const str = i.toString(16);
  num2hexHasMap[i] = str.length === 1 ? "0" + str : str;
}

binary2Hex = (binary: Uint8Array, offset = 0, end = binary.length) => {
  let str = "";
  while (offset < end) {
    str += num2hexHasMap[binary[offset++]];
  }
  return str;
};
export { binary2Hex };
