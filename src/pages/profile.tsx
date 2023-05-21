import { TopNav } from "~/layout";
import { ConnectButtonCustom } from "~/layout/ConnectButtonCustom";
// Constant for freeatnet to call the API - we get all community members scores and organize them like here https://news.kiwistand.com/community

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PROFILE_DATA = [
  {
    wallet_address: "...",
    kiwi_score: "...",
    last10_submissions: "...",
    last10_upvotes: "...",
  },
];

// To add later: Description, links and badges

const Profile = () => {
  return (
    <>
      <TopNav />
      <div className="mx-auto mb-8 max-w-5xl px-4 pt-4 text-center text-xl font-bold lg:px-0">
        <p>
          To create your Profile, check your kiwi score and see all your upvotes
          and submissions you need to connect wallet that owns a Kiwi NFT.
        </p>
        <br />
        <hr className="mx-auto my-4 w-1/4 bg-gray-400 text-left" />
        <div className="mx-auto mb-4 max-w-5xl px-4 pt-4 text-center text-base lg:px-0">
          <p> If you already have Kiwi NFT you can connect your wallet here:</p>
        </div>
        <ConnectButtonCustom className="w-1/2 bg-black px-4 py-2 text-base text-white hover:bg-blue-700"></ConnectButtonCustom>
        <br />
        <br />
        <div className="mx-auto mb-4 max-w-5xl px-4 pt-4 text-center text-base lg:px-0">
          <p> And if you don’t have Kiwi NFT yet you can mint it here:</p>
        </div>
        <a
          href="https://zora.co/collect/0xebb15487787cbf8ae2ffe1a6cca5a50e63003786"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="w-1/2 bg-kiwi px-4 py-2 text-base text-white hover:bg-blue-700">
            Mint Kiwi NFT for 0.005Ξ (on Zora)
          </button>
        </a>
      </div>
    </>
  );
};

export default Profile;
