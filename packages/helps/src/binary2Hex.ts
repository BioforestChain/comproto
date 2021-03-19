let binary2Hex: (binary: Uint8Array) => string;
declare var process: unknown;
declare var Buffer: unknown;

const num2hexHasMap: { [u8: number]: string } = Object.create(null);
for (let i = 0; i < 256; i++) {
  const str = i.toString(16);
  num2hexHasMap[i] = str.length === 1 ? "0" + str : str;
}

binary2Hex = (binary: Uint8Array) => {
  let str = "";
  for (const u8 of binary) {
    str += num2hexHasMap[u8];
  }
  return str;
};
export { binary2Hex };
