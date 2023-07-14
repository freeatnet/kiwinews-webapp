import { ConnectButton } from "@rainbow-me/rainbowkit";
import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";

export function TopNav() {
  const { pathname } = useRouter();

  return (
    <div className="flex h-16 w-full justify-center bg-gray-50 shadow shadow-gray-400/10">
      <div className="mx-4 flex max-w-4xl flex-1 items-center justify-between md:mx-8">
        <div className="flex items-center">
          <div className="mr-4 h-8 w-8 rounded-full border-4 border-solid border-black bg-green-500"></div>
          <div className="divide-x divide-solid divide-gray-300">
            <Link
              href="/"
              className={classNames(
                "px-4 py-2",
                pathname === "/" && "font-bold"
              )}
            >
              top
            </Link>
            <Link
              href="/new"
              className={classNames(
                "px-4 py-2",
                pathname === "/new" && "font-bold"
              )}
            >
              new
            </Link>
            <Link
              href="/submit"
              className={classNames(
                "px-4 py-2",
                pathname === "/submit" && "font-bold"
              )}
            >
              submit
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
        <ConnectButton
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "address",
          }}
          chainStatus="icon"
          showBalance={false}
        />
      </div>
    </div>
  );
}
