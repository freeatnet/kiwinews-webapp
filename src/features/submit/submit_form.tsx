import { BigNumber } from "@ethersproject/bignumber";
import { useCallback, type FormEventHandler } from "react";
import invariant from "ts-invariant";
import { useSignTypedData } from "wagmi";

import {
  STORY_EIP712_DOMAIN,
  STORY_EIP712_TYPES,
  STORY_MESSAGE_TYPE,
} from "~/constants";
import { TopNav } from "~/layout";
import { api } from "~/utils/api";

export function SubmitForm() {
  const { mutateAsync: postStory } = api.post.story.useMutation();

  const { signTypedDataAsync } = useSignTypedData({
    domain: STORY_EIP712_DOMAIN,
    types: STORY_EIP712_TYPES,
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
      <TopNav />
      <div className="mx-auto mb-8 max-w-5xl px-4 pt-4 lg:px-0">
        <form
          className="mx-auto flex w-full max-w-xl flex-col items-center space-y-5 px-4 pt-4"
          onSubmit={handleSubmit}
        >
          <div className="flex w-full flex-col space-y-2">
            <label htmlFor="title" className="text-base">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="box-border w-full border p-2 text-base"
            />
          </div>
          <div className="flex w-full flex-col space-y-2">
            <label htmlFor="href" className="text-base">
              URL
            </label>
            <input
              id="href"
              name="href"
              type="url"
              className="box-border w-full border p-2 text-base"
            />
          </div>

          <button
            type="submit"
            className="box-border w-full bg-black px-4 py-2 font-bold text-white hover:bg-kiwi"
          >
            Submit
          </button>
        </form>
      </div>
    </>
  );
}
