import { type NextApiRequest, type NextApiResponse } from "next";

import { importMessages } from "~/server/services/kiwistand";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  await importMessages();

  res.status(200).end();
}
