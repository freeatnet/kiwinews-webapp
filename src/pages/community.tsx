import { TopNav } from "~/layout";

// Constant for freeatnet to call the API - we get all community members scores and organize them like here https://news.kiwistand.com/community

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const COMMUNITY_SCOREBOARD = [
  {
    wallet_address: "...",
    profile_link: "http://...",
    kiwi_score: "...",
  },
];

const CommunityPage = () => {
  return (
    <>
      <TopNav />
      <div className="mx-auto mb-0 max-w-5xl px-0 pt-4 text-center text-2xl font-bold lg:px-0">
        <p>Community</p>
      </div>
      <div className="mx-auto mb-8 max-w-5xl px-4 pt-0 text-center lg:px-0">
        <p>(click the name to see their profile)</p>
      </div>
      <hr className="mx-auto my-4 w-1/4 bg-gray-400 text-left" />
      <div className="mx-auto mb-4 max-w-5xl px-4 pt-0 text-center text-2xl font-bold lg:px-0">
        <p>Join our community</p>
      </div>
      <div className="mx-auto mb-0 max-w-5xl px-4 pt-0 text-center text-lg font-bold lg:px-0">
        <p>Mint Kiwi NFT to:</p>
      </div>
      <div className="mx-auto mb-8 max-w-5xl px-4 pt-0 text-center lg:px-0">
        <ul className="mx-auto list-inside list-disc">
          <li>submit and upvote stories to shape the discourse,</li>
          <li>expose your content to a broader audience,</li>
          <li>gain access to “Kiwi News NFT Holder” Telegram channel</li>
        </ul>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://ipfs.decentralized-content.com/ipfs/bafkreierdgazvr3olgitxjhhspmb2dsyzaqti5nqegxb5rjoixzs6y6sc4"
        alt="Kiwi News NFT"
        className="mx-auto mb-2 max-h-[400px] max-w-[400px]"
      />
      <div className="mx-auto mb-8 max-w-5xl px-4 pt-0 text-center lg:px-0">
        <a href="https://etherscan.io/address/0xebb15487787cbf8ae2ffe1a6cca5a50e63003786">
          (View on Etherscan)
        </a>
        <br />
        <a
          target="_blank"
          href="https://zora.co/collect/0xebb15487787cbf8ae2ffe1a6cca5a50e63003786"
        >
          <button className="mt-1 w-full bg-kiwi px-4 py-2 font-bold text-white hover:bg-blue-700 sm:w-64">
            Mint Kiwi NFT for 0.005Ξ (on Zora)
          </button>
        </a>
      </div>
    </>
  );
};

export default CommunityPage;
