import { karla } from "@/styles/fonts";
import Head from "next/head";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Head>
        <title>Secure file Sharing</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${karla.className} h-full w-full text-[#030303]`}>
        {children}
      </main>
    </>
  );
};
