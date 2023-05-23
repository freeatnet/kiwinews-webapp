import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";

import { ConnectButtonCustom } from "./ConnectButtonCustom";

export function TopNav() {
  const { pathname } = useRouter();

  return (
    <div className="mb-4 flex h-auto w-full flex-col items-center justify-center bg-kiwi">
      <div className="mx-2 flex w-full flex-col items-center justify-between sm:mx-4 sm:max-w-4xl sm:flex-row md:mx-8">
        <h1 className="mb-2 w-full text-center text-lg font-bold sm:mb-0 sm:mr-8 sm:text-left sm:text-2xl">
          🥝 Kiwi News
        </h1>
        <div className="flex w-full flex-col items-center justify-center sm:flex-row sm:justify-start">
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
          </div>
          <div className="mt-2 sm:ml-4 sm:mt-0">
            <ConnectButtonCustom></ConnectButtonCustom>
          </div>
        </div>
      </div>
    </div>
  );
}
