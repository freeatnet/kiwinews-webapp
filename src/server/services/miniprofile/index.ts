import { publicClient } from "~/server/config/viem";

const NAME_CACHE_TTL_MS = 3600_000;
const ensNameCache = new Map<
  string,
  { ensName: string | null; retrievedAt: number }
>();

async function getEnsNameWithCache(address: `0x${string}`) {
  const cached = ensNameCache.get(address);
  if (cached && cached.retrievedAt + NAME_CACHE_TTL_MS > Date.now()) {
    return cached.ensName;
  }

  const ensName = await publicClient.getEnsName({ address });
  ensNameCache.set(address, { ensName, retrievedAt: Date.now() });
  return ensName;
}

export async function miniProfileForAddress(
  address: `0x${string}`
): Promise<{ address: `0x${string}`; displayName: string | null }> {
  return {
    address,
    displayName: await getEnsNameWithCache(address),
  };
}
