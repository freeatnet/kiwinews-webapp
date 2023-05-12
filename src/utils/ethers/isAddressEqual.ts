export function isAddressEqual(
  address1: string | null | undefined,
  address2: string | null | undefined
): boolean {
  return (
    typeof address1 === "string" &&
    typeof address2 === "string" &&
    address1.toLowerCase() === address2.toLowerCase()
  );
}
