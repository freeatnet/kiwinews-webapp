import { useAccount } from "wagmi";

import { TopNav } from "~/layout";
import { ConnectButtonCustom } from "~/layout/ConnectButtonCustom";

import SubmitCopy from "./submit_copy";

// in the page component

const Submit = () => {
  const { isConnected } = useAccount();
  if (!isConnected) {
    return (
      <>
        <TopNav />
        <div className="mx-auto mb-8 max-w-5xl px-4 pt-4 text-center text-xl font-bold lg:px-0">
          <p>
            To be able to submit stories you need to connect wallet that owns a
            Kiwi NFT.
          </p>
          <br />
          <hr className="mx-auto my-4 w-1/4 bg-gray-400 text-left" />
          <div className="mx-auto mb-4 max-w-5xl px-4 pt-4 text-center text-base lg:px-0">
            <p>
              {" "}
              If you already have Kiwi NFT you can connect your wallet here:
            </p>
          </div>
          <ConnectButtonCustom></ConnectButtonCustom>
          <br />
          <br />
          <div className="mx-auto mb-4 max-w-5xl px-4 pt-4 text-center text-base lg:px-0">
            <p> And if you don’t have Kiwi NFT yet you can mint it here:</p>
          </div>
          <button className="w-1/2 bg-kiwi px-4 py-2 text-base text-white hover:bg-blue-700">
            Mint Kiwi NFT for 0.005Ξ (on Zora)
          </button>
        </div>
      </>
    );
  }
  return <SubmitCopy />;
};

export default Submit;
