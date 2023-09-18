import canonicalize from "canonicalize";
import { encode } from "cbor-x";
import { concat, keccak256 } from "viem";

export function getMessageId({
  type,
  title,
  href,
  timestamp,
  signature,
}: {
  type: "amplify";
  title: string;
  href: string;
  timestamp: number;
  signature: string;
}) {
  const timestampHex: `0x${string}` = `0x${timestamp
    .toString(16)
    .padStart(8, "0")}`;

  const digestHex = keccak256(
    encode(
      canonicalize({
        type,
        title,
        href,
        timestamp,
        signature,
      })
    )
  );

  return concat([timestampHex, digestHex]);
}
