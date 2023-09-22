/* eslint-disable jsx-a11y/alt-text -- the output is an image! */
/* eslint-disable @next/next/no-img-element -- not applicable */
import { ImageResponse } from "@vercel/og";
import { decode as base58Decode } from "bs58";
import { type NextRequest } from "next/server";
import { type Font } from "satori";
import { toHex } from "viem";
import { z } from "zod";

import { formatAddressForDisplay } from "~/helpers";
import { apiProxy } from "~/utils/api/apiProxy";

export const config = {
  runtime: "edge",
};

const QUERY_SCHEMA = z.object({
  messageId: z
    .string()
    .transform((val): `0x${string}` => toHex(base58Decode(val))),
});

async function getFonts() {
  // This is unfortunate but I can't figure out how to load local font files
  // when deployed to vercel.
  const [interRegular, interMedium, interSemiBold, interBold] =
    await Promise.all([
      fetch(`https://rsms.me/inter/font-files/Inter-Regular.woff`).then((res) =>
        res.arrayBuffer(),
      ),
      fetch(`https://rsms.me/inter/font-files/Inter-Medium.woff`).then((res) =>
        res.arrayBuffer(),
      ),
      fetch(`https://rsms.me/inter/font-files/Inter-SemiBold.woff`).then(
        (res) => res.arrayBuffer(),
      ),
      fetch(`https://rsms.me/inter/font-files/Inter-Bold.woff`).then((res) =>
        res.arrayBuffer(),
      ),
    ]);

  return [
    {
      name: "Inter",
      data: interRegular,
      style: "normal",
      weight: 400,
    },
    {
      name: "Inter",
      data: interMedium,
      style: "normal",
      weight: 500,
    },
    {
      name: "Inter",
      data: interSemiBold,
      style: "normal",
      weight: 600,
    },
    {
      name: "Inter",
      data: interBold,
      style: "normal",
      weight: 700,
    },
  ] satisfies Font[];
}

function hexToRgb(hex: string): [number, number, number] {
  const bigint = parseInt(hex, 16);

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return [r, g, b];
}

function tintColor(
  rgb: [number, number, number],
  tint: number,
): [number, number, number] {
  const [r, g, b] = rgb;
  const tintedR = Math.round(r + (255 - r) * tint);
  const tintedG = Math.round(g + (255 - g) * tint);
  const tintedB = Math.round(b + (255 - b) * tint);

  return [tintedR, tintedG, tintedB];
}

function generateAvatarColors(address: string) {
  const hash = address.toLowerCase().replace(/^0x/iu, "");
  const baseColor = hash.substring(0, 6);
  const rgbColor = hexToRgb(baseColor);

  const colors: string[] = [];

  for (let i = 0; i < 5; i += 1) {
    const tintedColor = tintColor(rgbColor, 0.15 * i);
    colors.push(`rgb(${tintedColor[0]}, ${tintedColor[1]}, ${tintedColor[2]})`);
  }

  return `radial-gradient(75.29% 75.29% at 64.96% 24.36%, #fff 0.52%, ${colors[4]} 31.25%, ${colors[2]} 51.56%, ${colors[1]} 65.63%, ${colors[0]} 82.29%, ${colors[3]} 100%)`;
}

export default async function handler(req: NextRequest) {
  const { messageId } = QUERY_SCHEMA.parse(
    Object.fromEntries(req.nextUrl.searchParams.entries()),
  );

  const {
    story: { poster, points, title },
  } = await apiProxy.showStory.get.fetch({ messageId });

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0F3106",
          fontSize: 54,
          fontWeight: 600,

          textRendering: "optimizeLegibility",
        }}
      >
        <div
          style={{
            margin: 180,
            fontFamily: "Inter",
            fontWeight: 600,
            color: "#FFFFFF",
            textAlign: "center",
          }}
        >
          {title}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 40,
            color: "#FFFFFF",
            fontSize: 30,
            fontWeight: 400,
            textDecoration: "underline",
          }}
        >
          kiwinews.lol
        </div>

        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "40px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {poster.avatar ? (
            <img
              src={poster.avatar}
              style={{
                height: "50px",
                width: "50px",
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.6)",
              }}
            />
          ) : (
            <div
              style={{
                height: "50px",
                width: "50px",
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.6)",
                backgroundImage: generateAvatarColors(poster.address),
              }}
            />
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              marginLeft: "10px",
            }}
          >
            <div style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 400 }}>
              submitted by
            </div>
            <div style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 600 }}>
              {formatAddressForDisplay(poster.address, poster.displayName)}
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "40px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src="https://www.dropbox.com/scl/fi/x4wp63h75k0bbn4o0gpg6/OG_Image_Upvote.png?rlkey=v4yrg3jk3j4sk0yj0h7w5kajl&dl=1"
            width="30"
            height="25"
            alt="Upvote Icon"
          />
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 30,
              fontWeight: 600,
              marginLeft: "10px",
            }}
          >
            {`${points} ${points != 1 ? "points" : "point"}`}
          </div>
        </div>

        <img
          src="https://www.dropbox.com/scl/fi/owenazr50holz72erokco/OG_Image_Kiwi.png?rlkey=1i9a2qv3bf01ovu2kpf92k090&dl=1"
          alt="Kiwi"
          width="92"
          height="126"
          style={{
            position: "absolute",
            bottom: "40px",
            right: "40px",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 675,
      fonts: await getFonts(),
    },
  );
}
