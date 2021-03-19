let hex2Binary: (hex: string) => Uint8Array;
declare var process: unknown;
declare var Buffer: unknown;
if (typeof Buffer === "function" && typeof process === "object") {
  hex2Binary = (hex: string) => (Buffer as any).from(hex.length % 2 === 0 ? hex : "0" + hex, "hex");
} else {
  const hex2numHasMap: { [hex: string]: number } = Object.create(null);
  for (let i = 0; i < 256; i++) {
    const str = i.toString(16);
    hex2numHasMap[str] = i;
    if (str.length === 1) {
      hex2numHasMap["0" + str] = i;
    }
  }
  Object.freeze(hex2numHasMap);

  hex2Binary = (hex: string) => {
    const res = new Uint8Array(
      (hex.length + /**一定要是个偶数，可能会少一位，这里+1不会影响结果 */ 1) >> 1,
    );
    const len2 = hex.length + 2;
    for (let i = res.length - 1, start = -2; i >= 0; i--, start -= 2) {
      res[i] = hex2numHasMap[hex.slice(start, len2 + start)];
    }
    return res;
  };
}
export { hex2Binary };
