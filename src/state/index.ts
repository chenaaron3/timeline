import { create, type StoreApi, type UseBoundStore } from "zustand";

import { immer } from "zustand/middleware/immer";
import { type Event, type Events, type ImageMap } from "../utils/types";
import { shuffle, setSubtract, areSetsEqual } from "~/utils/utils";

// World History Deck
import WorldHistoryData from "~/data/world_history.json";
import { IMAGE_MAP as worldHistoryImageMap } from "~/generated/WorldHistoryImages";
const worldHistoryDeck: Events = WorldHistoryData;

type DECK_NAMES = "world_history" | "test_deck";

type GameState = {
  deck: Events;
  cardMap: Record<string, Event>;
  activeCard: Event | undefined;
  playedCards: Events;
  discardedCards: Events;
};

type GameActions = {
  init: (deckName: DECK_NAMES) => void;
  drawCard: () => void;
  playCard: (index: number) => void;
};

// Get deck by name and perform validation
const getDeck = (deckName: DECK_NAMES): Events => {
  let imageMap: ImageMap;
  let deckData: Events;

  // Initalize deck based on name
  if (deckName === "world_history") {
    imageMap = worldHistoryImageMap;
    deckData = worldHistoryDeck;
  } else {
    imageMap = {};
    deckData = [];
  }

  // Clone the data so we can mutate it
  imageMap = JSON.parse(JSON.stringify(imageMap)) as ImageMap;
  deckData = JSON.parse(JSON.stringify(deckData)) as Events;

  // Validate that all cards have images and all images have cards
  const allImages = new Set(Object.keys(imageMap));
  const allCards = new Set(deckData.map((card) => card.id));
  if (!areSetsEqual(allImages, allCards)) {
    const extraImages = setSubtract(allImages, allCards);
    const extraCards = setSubtract(allCards, allImages);
    let message = "Message: ";
    if (extraImages.size > 0) {
      message += "Extra Images:" + JSON.stringify(extraImages);
    }
    if (extraCards.size > 0) {
      message += "Extra Cards:" + JSON.stringify(extraCards);
    }
    throw new Error("Image and Card Mismatch! " + message);
  }

  // Assign the image into the cards
  for (const card of deckData) {
    // Unsafe assignment of an error typed value.
    // eslint-disable-next-line
    card.image = imageMap[card.id];
  }

  return deckData;
};

// Initialize the game state
const initGame = (state: GameState, deckName: DECK_NAMES) => {
  console.log("Initializing Game!");

  // Get the deck data and image map
  const deckData = getDeck(deckName);
  // Shuffle the deck
  const shuffledDeck = shuffle(deckData);

  // Create a map from card ID to card. Must create map
  // before removing cards from the deck.
  const cardMap = {} as Record<string, Event>;
  for (const card of deckData) {
    cardMap[card.id] = card;
  }
  state.cardMap = cardMap;

  // Draw a card to start the game
  state.activeCard = shuffledDeck.pop();
  // Play a card on the table
  state.playedCards = [shuffledDeck.pop()!];
  state.deck = shuffledDeck;
};

// Draw a card and set it as the active card
const drawCard = (state: GameState) => {
  if (state.deck.length > 0) {
    const drawnCard = state.deck.pop();
    state.deck = state.deck;
    state.activeCard = drawnCard;
  }
};

// Plays the active card into the field
const playCard = (state: GameState, index: number) => {
  state.playedCards.splice(index, 0, state.activeCard!);
  drawCard(state);
};

export const gameStore = create<GameState & GameActions>()(
  immer((set) => ({
    deck: [] as Events,
    cardMap: {} as Record<string, Event>,
    activeCard: undefined as Event | undefined,
    playedCards: [] as Events,
    discardedCards: [] as Events,
    init: (deckName: DECK_NAMES) =>
      set((state) => {
        initGame(state, deckName);
      }),
    drawCard: () => {
      set((state) => {
        drawCard(state);
      });
    },
    playCard: (index: number) =>
      set((state) => {
        playCard(state, index);
      }),
  })),
);

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (const k of Object.keys(store.getState())) {
    // eslint-disable-next-line
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};

export const useGameStore = createSelectors(gameStore);
