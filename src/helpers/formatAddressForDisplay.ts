/**
 * Given wallet address or ens name returns string to display
 * @param address wallet address string
 * @param ensName ens name string
 * @returns ens name or short address of type '0xF1e1..80Fa'
 */
export function formatAddressForDisplay(
  address: string,
  ensName?: string | null
): string {
  return ensName ?? `${address.slice(0, 6)}..${address.slice(-4)}`;
}
