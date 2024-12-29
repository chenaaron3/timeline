import { GeistSans } from 'geist/font/sans';
import Head from 'next/head';
import { useEffect } from 'react';
import { Details } from '~/components/Details';
import { useGameStore } from '~/state';

import { Board } from '../components/Board';
import { Header } from '../components/Header';

export default function Home() {
  const init = useGameStore.use.init();

  // Initalize the board
  useEffect(() => {
    init();
  }, [init])

  return (
    <>
      <Head>
        <title>TimeQuest</title>
        <meta name="description" content="Online multiplayer game to learn about history" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={GeistSans.className + " h-screen"}>
        <div className="h-full flex flex-col text-[--sub-text-color] bg-gradient-to-br from-[var(--sub-color)] to-[var(--sub-alt-color)]">
          <Header />
          <Board />
          <Details />
        </div>
      </main>
    </>
  );
}
