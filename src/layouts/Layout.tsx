import { Navbar } from "@/components/Navbar";
import Head from "next/head";
import { type PropsWithChildren } from "react";

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Head>
        <title>Issue Manager</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-primary-bg">
        <Navbar />
        <div className="flex flex-col items-center pt-16">{children}</div>
      </main>
    </>
  );
};
