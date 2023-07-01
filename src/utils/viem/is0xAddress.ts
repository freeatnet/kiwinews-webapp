export function is0xAddress(address: string): address is `0x${string}` {
  return address.startsWith("0x");
}
