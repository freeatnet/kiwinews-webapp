import { BigNumber } from "@ethersproject/bignumber";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { type FormEventHandler, useCallback } from "react";
import invariant from "ts-invariant";
import { useSignTypedData } from "wagmi";

import { api } from "~/utils/api";

const EIP712_DOMAIN = {
  name: "kiwinews",
  version: "1.0.0",
  salt: "0xfe7a9d68e99b6942bb3a36178b251da8bd061c20ed1e795207ae97183b590e5b",
} as const;

const EIP712_TYPES = {
  Message: [
    { name: "title", type: "string" },
    { name: "href", type: "string" },
    { name: "type", type: "string" },
    { name: "timestamp", type: "uint256" },
  ],
} as const;

const STORY_MESSAGE_TYPE = "amplify" as const;

export default function Submit() {
  const { mutateAsync: postStory } = api.post.story.useMutation();

  const { signTypedDataAsync } = useSignTypedData({
    domain: EIP712_DOMAIN,
    types: EIP712_TYPES,
    onError: (error) => {
      console.error(error);
    },
  });

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    async (event) => {
      event.preventDefault();
      const target = event.currentTarget;
      const formData = new FormData(target);

      const href = formData.get("href");
      invariant(typeof href === "string", "href must be a string");

      const title = formData.get("title");
      invariant(typeof title === "string", "title must be a string");

      const timestamp = Math.trunc(Date.now() / 1000);

      const signature = await signTypedDataAsync({
        value: {
          href,
          title,
          type: STORY_MESSAGE_TYPE,
          timestamp: BigNumber.from(timestamp),
        },
      });

      const response = await postStory({
        href,
        title,
        type: STORY_MESSAGE_TYPE,
        timestamp,
        signature,
      });

      // eslint-disable-next-line no-console -- TODO: remove
      console.log(response);
    },
    [postStory, signTypedDataAsync]
  );

  return (
    <>
      <div className="flex h-16 w-full justify-center">
        <div className="flex max-w-5xl flex-1 items-center justify-between">
          <h1 className="text-lg font-extrabold">Submit</h1>
          <ConnectButton
            accountStatus="address"
            chainStatus="icon"
            showBalance={false}
          />
        </div>
      </div>
      <div className="mx-auto mb-8 max-w-5xl px-4 pt-4 lg:px-0">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label
              htmlFor="title"
              className="block text-sm font-semibold leading-6 text-gray-600"
            >
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Title"
              required
              className="mt-1.5 rounded-md border border-gray-300 p-2"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="href"
              className="block text-sm font-semibold leading-6 text-gray-600"
            >
              URL
            </label>
            <input
              id="href"
              name="href"
              type="url"
              placeholder="URL"
              className="mt-1.5 rounded-md border border-gray-300 p-2"
            />
          </div>

          <button type="submit" className="bg-blue-500 px-4 py-2 text-white">
            Submit
          </button>
        </form>
      </div>
    </>
  );
}
