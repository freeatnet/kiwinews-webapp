import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { type AppType } from "next/app";
import { WagmiConfig } from "wagmi";

import { chains, wagmiConfig } from "~/features/wallet";
import { api } from "~/utils/api";

import "@rainbow-me/rainbowkit/styles.css";
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default api.withTRPC(MyApp);
