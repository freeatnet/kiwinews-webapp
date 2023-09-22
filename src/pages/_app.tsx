import { type AppType } from "next/app";
import { WagmiConfig } from "wagmi";

import { wagmiConfig } from "~/features/wallet/config";
import "~/features/wallet/createWeb3Modal";
import { api } from "~/utils/api";

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <Component {...pageProps} />
    </WagmiConfig>
  );
};

export default api.withTRPC(MyApp);
