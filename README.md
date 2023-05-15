# kiwinews-webapp

This is an alternative frontend for https://news.kiwistand.com/, a web3-focused hacker news project by [@TimDaub](https://github.com/TimDaub).

## Requirements

Running code in this repo requires:

- A POSIX environment, probably (never tested on Windows)
- Node.js v18.x
- Yarn v1.x

Other dependencies should be installed automatically.

Contributing to this repo (successfully and efficiently) requires:

- git
- A multi-tab or multi-pane terminal
- An editor that:
  1. Supports custom ESLint configurations and respects `eslint-plugin-prettier` (e.g. VSCode with [dbaeumer.vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) with `"source.fixAll.eslint": true`);
  2. Supports `.editorconfig` (e.g., VSCode with [editorconfig.editorconfig](https://marketplace.visualstudio.com/items?itemName=editorconfig.editorconfig)).

## Contributing

1. Check out the repo.
2. Copy `.env.example` to `.env` and adjust the variables (you'll need an [Alchemy API key](https://alchemy.com) and a [WalletConnect Cloud Project ID](https://cloud.walletconnect.com)).
3. Run `yarn install` to install dependencies.
4. Start the dev server by running `yarn dev`.

---


This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
