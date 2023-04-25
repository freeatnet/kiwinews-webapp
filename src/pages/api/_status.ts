import { type NextApiResponse, type NextApiRequest } from "next";

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ status: "ok" });
}
