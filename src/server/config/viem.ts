import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

import { env } from "~/env.mjs";

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(env.VIEM_HTTP_RPC),
  batch: {
    multicall: true,
  },
});
