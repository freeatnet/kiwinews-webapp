import { publicClient } from "~/server/config/viem";

const NAME_CACHE_TTL_MS = 3600_000;
const ensNameCache = new Map<
  string,
  {
    ensName: string | null;
    avatar: string | null;
    retrievedAt: number;
  }
>();

async function getEnsDetailsWithCache(address: `0x${string}`) {
  const cached = ensNameCache.get(address);
  if (cached && cached.retrievedAt + NAME_CACHE_TTL_MS > Date.now()) {
    return {
      ensName: cached.ensName,
      avatar: cached.avatar,
    };
  }

  const ensName = await publicClient.getEnsName({ address });
  const avatar = ensName
    ? await publicClient.getEnsAvatar({ name: ensName })
    : null;
  ensNameCache.set(address, { ensName, avatar, retrievedAt: Date.now() });

  return {
    ensName,
    avatar,
  };
}

export async function miniProfileForAddress(address: `0x${string}`): Promise<{
  address: `0x${string}`;
  displayName: string | null;
  avatar: string | null;
}> {
  const { ensName: displayName, avatar } =
    await getEnsDetailsWithCache(address);

  return {
    address,
    displayName,
    avatar,
  };
}
