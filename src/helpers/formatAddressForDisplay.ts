/**
 * Given wallet address or ens name returns string to display
 * @param address wallet address string
 * @param displayName human-readable name string
 * @returns ens name or short address of type '0xF1e1..80Fa'
 */
export function formatAddressForDisplay(
  address: string,
  displayName?: string | null,
): string {
  return displayName ?? `${address.slice(0, 6)}..${address.slice(-4)}`;
}
