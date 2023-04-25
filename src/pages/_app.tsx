import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { type AppType } from "next/app";
import { WagmiConfig } from "wagmi";

import { chains, wagmiClient } from "~/features/wallet";
import { api } from "~/utils/api";

import "@rainbow-me/rainbowkit/styles.css";
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default api.withTRPC(MyApp);
