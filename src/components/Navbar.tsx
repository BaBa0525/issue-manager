import { Menu, Transition } from "@headlessui/react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import React, { type FC } from "react";
import { AiOutlineUser } from "react-icons/ai";
import { GoSignOut } from "react-icons/go";

export const Navbar: FC = () => {
  return (
    <nav className="fixed z-10 flex h-16 w-full items-center justify-between bg-navbar px-10">
      <h1 className="m-3 font-roboto-mono text-2xl font-semibold text-white">
        Issue Manager
      </h1>
      <UserInfo />
    </nav>
  );
};

const UserInfo: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    sessionData && (
      <div className="relative">
        <Menu as="div" className="flex-co relative flex">
          <Menu.Button>
            {sessionData.user.image ? (
              <Image
                className="rounded-full outline-1"
                src={sessionData.user.image}
                alt="you"
                width={40}
                height={40}
              />
            ) : (
              <AiOutlineUser className="h-10 w-10 rounded-full border border-black/70" />
            )}
          </Menu.Button>
          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              as="div"
              className="absolute right-0 mt-16 flex w-72 flex-col rounded-2xl bg-gray-100 p-2 shadow-xl"
            >
              <div className="mb-2 w-full rounded-2xl bg-white p-4">
                <div>{sessionData.user.login || "Your name"}</div>
                <div className="text-sm font-light text-gray-500">
                  {sessionData.user.email || "Your email"}
                </div>
              </div>

              <Menu.Item>
                <button
                  className="flex h-10 items-center gap-6 rounded-md px-4 py-2 hover:bg-gray-200"
                  onClick={() => void signOut()}
                >
                  <GoSignOut className="h-6 w-6" />
                  <span>Sign out</span>
                </button>
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    )
  );
};
