import { isAddress } from "viem";
import { z } from "zod";

import { env } from "~/env.mjs";

const EDITORS_PROFILE_SCHEMA = z.array(
  z.object({
    name: z.string().nonempty(),
    address: z
      .string()
      .refine(isAddress, { message: "Must be a valid address" }),
  })
);

const EDITORS_LINKS_SCHEMA = z.array(
  z.object({
    link: z.string().url(),
  })
);

async function fetchEditorsProfile() {
  const res = await fetch(env.KIWINEWS_EDITORS_PROFILE_URL);
  const json = await res.json();
  const [profile, ...restProfiles] = EDITORS_PROFILE_SCHEMA.parse(json);

  if (restProfiles.length > 0) {
    console.warn(
      "fetchEditorsProfile: expected one profile, but found multiple"
    );
  }

  return profile;
}

async function fetchEditorsLinks() {
  const res = await fetch(env.KIWINEWS_EDITORS_LINKS_URL);
  const json = await res.json();
  return EDITORS_LINKS_SCHEMA.parse(json);
}

export async function fetchEditorsPicks() {
  const [editor, links] = await Promise.all([
    fetchEditorsProfile(),
    fetchEditorsLinks(),
  ]);

  if (!editor || links.length === 0) {
    return null;
  }

  return {
    editor,
    links,
  };
}
