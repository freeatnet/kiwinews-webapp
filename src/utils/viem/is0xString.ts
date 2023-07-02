export function is0xString(some: string): some is `0x${string}` {
  return some.startsWith("0x");
}
