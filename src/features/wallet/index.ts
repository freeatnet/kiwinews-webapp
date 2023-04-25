import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { configureChains, createClient } from "wagmi";
import { mainnet } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import { env } from "~/env.mjs";

const {
  NEXT_PUBLIC_RAINBOW_APP_NAME: RAINBOW_APP_NAME,
  NEXT_PUBLIC_ALCHEMY_API_KEY: ALCHEMY_API_KEY,
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: WALLETCONNECT_PROJECT_ID,
} = env;

const { chains, provider } = configureChains(
  [mainnet],
  [
    alchemyProvider({
      apiKey: ALCHEMY_API_KEY,
    }),
    publicProvider(),
  ]
);

export { chains, provider };

const { connectors } = getDefaultWallets({
  appName: RAINBOW_APP_NAME,
  projectId: WALLETCONNECT_PROJECT_ID,
  chains,
});

export const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});
