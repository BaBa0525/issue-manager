import { type FC } from "react";

export const Navbar: FC = () => {
  return (
    <nav className="fixed z-10 flex h-12 w-full items-center bg-navbar">
      <h1 className="m-3 font-roboto-mono text-2xl font-semibold text-white">
        Dcard Tools
      </h1>
    </nav>
  );
};
