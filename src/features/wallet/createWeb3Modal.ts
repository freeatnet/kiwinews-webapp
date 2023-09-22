import { createWeb3Modal } from "@web3modal/wagmi/react";

import { env } from "~/env.mjs";

import { wagmiConfig, chains } from "./config";

createWeb3Modal({
  wagmiConfig,
  projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains,
  themeMode: "light",
});
