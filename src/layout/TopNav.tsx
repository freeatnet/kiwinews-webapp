import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

export function TopNav() {
  const { pathname } = useRouter();

  return (
    <div className="flex h-16 w-full justify-center bg-gray-50 shadow shadow-gray-400/10">
      <div className="mx-auto flex max-w-4xl flex-1 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="relative block h-8 w-8 rounded-full">
            <Image src="/favicon.png" alt="logo" fill sizes="256px" />
          </Link>
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
        <w3m-button balance="hide" />
      </div>
    </div>
  );
}
