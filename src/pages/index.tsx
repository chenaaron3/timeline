import { GeistSans } from 'geist/font/sans';
import Head from 'next/head';
import { Details } from '~/components/Details';
import { Lobby } from '~/components/Lobby';
import { Toaster } from '~/components/ui/sonner';
import { useInitialize } from '~/hooks/useInitialize';

import { Board } from '../components/Board';
import { Header } from '../components/Header';

export default function Home() {
  useInitialize();

  return (
    <>
      <Head>
        <title>TimeQuest</title>
        <meta name="description" content="Online multiplayer game to learn about history" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={GeistSans.className + " h-dvh w-dvw overscroll-none"}>
        <div className="h-full w-full overflow-hidden flex flex-col text-[--sub-text-color] bg-gradient-to-br from-[var(--sub-color)] to-[var(--sub-alt-color)]">
          <Header />
          <Board />
          <Details />
          <Lobby />
          <Toaster />
        </div>
      </main>
    </>
  );
}
