import { GeistSans } from 'geist/font/sans';
import Head from 'next/head';
import { useEffect } from 'react';
import { Details } from '~/components/Details';
import { useGameStore } from '~/state';

import { Header } from '../components/Header/Header';
import { Timeline } from '../components/Timeline';

export default function Home() {
  const init = useGameStore.use.init();

  // Initalize the board with the world history deck
  useEffect(() => {
    init("world_history");
  }, [init])

  return (
    <>
      <Head>
        <title>TimeQuest</title>
        <meta name="description" content="Online multiplayer game to learn about history" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={GeistSans.className + " h-screen"}>
        <div className="h-full text-[--sub-text-color] bg-gradient-to-br from-[var(--sub-color)] to-[var(--sub-alt-color)]">
          <Header />
          <Timeline />
          <Details />
        </div>
      </main>
    </>
  );
}
