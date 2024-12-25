import Head from "next/head";
import { GeistSans } from "geist/font/sans";
import Link from "next/link";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import { api } from "~/utils/api";
import { Deck, Event } from "~/utils/types";

import WorldHistoryData from "~/data/world_history.json";
import { Card } from "./components/Card";
import { useEffect, useState } from "react";

const worldHistoryDeck: Deck = WorldHistoryData;

function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function Home() {
  const [deck, setDeck] = useState([] as Deck);

  useEffect(() => {
    const shuffledDeck = shuffle(worldHistoryDeck);
    setDeck(shuffledDeck)
  }, [])

  return (
    <>
      <Head>
        <title>Timeline</title>
        <meta name="description" content="Online multiplayer game to learn about history" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={GeistSans.className + " h-full"}>
        <div className="bg-black text-white h-full">
          {/* Timeline */}
          <div className="w-full flex items-center justify-evenly pt-16 flex-wrap gap-10">
            {deck.map((event, i) => {
              return <Card key={"event" + i} event={event}></Card>
            })}
          </div>
        </div>
      </main>
    </>
  );
}
