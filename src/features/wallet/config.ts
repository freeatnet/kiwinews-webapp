import { walletConnectProvider } from "@web3modal/wagmi";
import { configureChains, createConfig } from "wagmi";
import { mainnet, optimism } from "wagmi/chains";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import { env } from "~/env.mjs";

const {
  NEXT_PUBLIC_RAINBOW_APP_NAME: RAINBOW_APP_NAME,
  NEXT_PUBLIC_ALCHEMY_API_KEY: ALCHEMY_API_KEY,
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: WALLETCONNECT_PROJECT_ID,
} = env;

export const chains = [mainnet, optimism];

const { publicClient } = configureChains(
  chains,
  [
    walletConnectProvider({
      projectId: WALLETCONNECT_PROJECT_ID,
    }),
    alchemyProvider({
      apiKey: ALCHEMY_API_KEY,
    }),
    publicProvider(),
  ],
  {
    batch: {
      multicall: true,
    },
  },
);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({
      chains,
      options: {
        projectId: WALLETCONNECT_PROJECT_ID,
        showQrModal: false,
      },
    }),
    new InjectedConnector({
      chains,
      options: { shimDisconnect: true },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: RAINBOW_APP_NAME,
      },
    }),
  ],
  publicClient,
});
