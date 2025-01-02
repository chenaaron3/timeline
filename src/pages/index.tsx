import { GeistSans } from 'geist/font/sans';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Details } from '~/components/Details';
import { Toaster } from '~/components/ui/sonner';
import { useGameStore } from '~/state';
import { DECK_NAMES, DISPLAY_DECKS } from '~/utils/constants';

import { Board } from '../components/Board';
import { Header } from '../components/Header';

export default function Home() {
  const init = useGameStore.use.init();
  const router = useRouter();
  // Access query parameters from the router object
  const { query, isReady } = router;
  const name = query.deck;
  const size = parseInt(query.size as string);
  const draws = parseInt(query.draws as string);

  useEffect(() => {
    // Initalize the board once the query parameters are ready
    if (isReady) {
      let deckName: DECK_NAMES | undefined;
      let deckSize: number | undefined;
      let deckDraws: number | undefined;
      // Check if deckSize is a number
      if (!isNaN(size) && size > 1) {
        deckSize = size
      }
      // Check if deck name is in DISPLAY_DECKS
      if (name && DISPLAY_DECKS.find((deck) => deck.id === name)) {
        deckName = name as DECK_NAMES
      } else {
        deckName = "world_history"
      }
      if (!isNaN(draws) && draws > 1) {
        deckDraws = draws
      }
      init(deckName, deckSize, deckDraws);
    }
  }, [isReady])

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
          <Toaster />
        </div>
      </main>
    </>
  );
}
