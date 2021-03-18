export function u8aConcat(u8as: ArrayLike<number>[], totalSize?: number) {
  if (totalSize === undefined) {
    totalSize = 0;
    for (const a of u8as) {
      totalSize += a.length;
    }
  }
  const res = new Uint8Array(totalSize);
  let offset = 0;
  for (const a of u8as) {
    res.set(a, offset);
    offset += a.length;
  }
  return res;
}
