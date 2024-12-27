import Head from "next/head";
import { GeistSans } from "geist/font/sans";

import { Timeline } from "../components/Timeline";
import { Scoreboard } from "../components/Scoreboard";

import { useEffect } from "react";
import { useGameStore } from '~/state';
import { Details } from "~/components/Details";

export default function Home() {
  const init = useGameStore.use.init();

  // Initalize the board with the world history deck
  useEffect(() => {
    init("world_history");
  }, [init])

  return (
    <>
      <Head>
        <title>Timeline</title>
        <meta name="description" content="Online multiplayer game to learn about history" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={GeistSans.className + " h-full"}>
        <div className="h-full text-white bg-black">
          <Scoreboard />
          <Timeline />
          <Details />
        </div>
      </main>
    </>
  );
}
