import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";

import { ConnectButtonCustom } from "./ConnectButtonCustom.js";

export function TopNav() {
  const { pathname } = useRouter();

  return (
    <div className="mb-4 flex h-auto w-full flex-col items-center justify-center bg-kiwi">
      <div className="mx-4 flex max-w-4xl flex-1 items-center justify-between md:mx-8">
        <h1 className="mb-0 text-left text-2xl font-bold">🥝 Kiwi News</h1>
        <div className="flex items-center">
          <div className="divide-x divide-solid divide-gray-300">
            <Link
              href="/"
              className={classNames(
                "px-4 py-2",
                pathname === "/" && "font-bold"
              )}
            >
              Top
            </Link>
            <Link
              href="/new"
              className={classNames(
                "px-4 py-2",
                pathname === "/new" && "font-bold"
              )}
            >
              New
            </Link>
            <Link
              href="/submit"
              className={classNames(
                "px-4 py-2",
                pathname === "/submit" && "font-bold"
              )}
            >
              Submit
            </Link>
            <Link
              href="/community"
              className={classNames(
                "px-4 py-2",
                pathname === "/community" && "font-bold"
              )}
            >
              Community
            </Link>
            <Link
              href="/profile"
              className={classNames(
                "px-4 py-2",
                pathname === "/profile" && "font-bold"
              )}
            >
              Profile
            </Link>
            {/* <Link
              href="/rules"
              className={classNames(
                "px-4 py-2",
                pathname === "/rules" && "font-bold"
              )}
            >
              rules
            </Link> */}
          </div>
        </div>
        <ConnectButtonCustom></ConnectButtonCustom>
        {/* // accountStatus={{
          //   smallScreen: "avatar",
          //   largeScreen: "address",
          // }}
          // chainStatus="icon"
          // showBalance={false} */}
      </div>
    </div>
  );
}
