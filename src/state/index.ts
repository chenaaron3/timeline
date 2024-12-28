import { create, StoreApi, UseBoundStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import OldWorldHistoryData from '~/data/old_world_history.json';
// World History Deck
import WorldHistoryData from '~/data/world_history.json';
import { IMAGE_MAP as oldWorldHistoryImageMap } from '~/generated/OldWorldHistoryImages';
import { IMAGE_MAP as worldHistoryImageMap } from '~/generated/WorldHistoryImages';
import { areSetsEqual, setSubtract, shuffle } from '~/utils/utils';

// Hard World History Deck
import { Event, Events, ImageMap } from '../utils/types';

const worldHistoryDeck: Events = WorldHistoryData;
const oldWorldHistoryDeck: Events = OldWorldHistoryData;

export type DECK_NAMES = "world_history" | "old_world_history";

type GameState = {
  deckName: DECK_NAMES;
  deck: Events;
  cardMap: Record<string, Event>;
  activeCard: Event | undefined;
  displayedCard: Event | undefined;
  playedCards: Events;
  discardedCards: Events;
  score: { correct: number; incorrect: number };
};

type GameActions = {
  init: () => void;
  selectDeck: (deckName: DECK_NAMES) => void;
  drawCard: () => void;
  playCard: (index: number) => void;
  learnCard: (cardID: string) => void;
  discardCard: () => void;
  acknowledgeCard: () => void;
};

// Get deck by name and perform validation
const getDeck = (deckName: DECK_NAMES): Events => {
  let imageMap: ImageMap;
  let deckData: Events;

  // Initalize deck based on name
  if (deckName === "world_history") {
    imageMap = worldHistoryImageMap;
    deckData = worldHistoryDeck;
  } else if (deckName === "old_world_history") {
    imageMap = oldWorldHistoryImageMap;
    deckData = oldWorldHistoryDeck;
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

// Change the deck name and reset the deck
const selectDeck = (state: GameState, deckName: DECK_NAMES) => {
  state.deckName = deckName;
  initGame(state);
};

// Initialize the game state
const initGame = (state: GameState) => {
  console.log("Initializing Game!");

  // Get the deck data and image map
  const deckData = getDeck(state.deckName);
  // Shuffle the deck
  const shuffledDeck = shuffle(deckData);
  // Sample a subset of cards from the deck so the game can end
  const sampledDeck = shuffledDeck.slice(0, 5);

  // Create a map from card ID to card. Must create map
  // before removing cards from the deck.
  const cardMap = {} as Record<string, Event>;
  for (const card of deckData) {
    cardMap[card.id] = card;
  }
  state.cardMap = cardMap;

  // Draw a card to start the game
  state.activeCard = sampledDeck.pop();
  // Play a card on the table
  state.playedCards = [sampledDeck.pop()!];
  state.deck = sampledDeck;
};

// Draw a card and set it as the active card
const drawCard = (state: GameState) => {
  // If theres more cards in the deck, draw it
  if (state.deck.length > 0) {
    const drawnCard = state.deck.pop();
    state.deck = state.deck;
    state.activeCard = drawnCard;
  } else {
    // Clear the active Card
    state.activeCard = undefined;
  }
};

// Learn about the card
const learnCard = (state: GameState, cardID: string) => {
  state.displayedCard = state.cardMap[cardID];
};

// Acknowledge the card and remove it from the display
const acknowledgeCard = (state: GameState) => {
  state.displayedCard = undefined;
};

// Plays the active card into the field
const playCard = (state: GameState, index: number) => {
  state.playedCards.splice(index, 0, state.activeCard!);
  state.score.correct += 1;
  drawCard(state);
};

// Discards the card into the discard pile
const discardCard = (state: GameState) => {
  state.discardedCards.push(state.activeCard!);
  state.score.incorrect += 1;
  // Learn about the card before completely discarding it
  learnCard(state, state.activeCard!.id);
  drawCard(state);
};

export const gameStore = create<GameState & GameActions>()(
  immer((set) => ({
    deckName: "world_history" as DECK_NAMES,
    deck: [] as Events,
    cardMap: {} as Record<string, Event>,
    activeCard: undefined as Event | undefined,
    displayedCard: undefined as Event | undefined,
    playedCards: [] as Events,
    discardedCards: [] as Events,
    score: { correct: 0, incorrect: 0 },
    selectDeck: (deckName: DECK_NAMES) =>
      set((state) => {
        selectDeck(state, deckName);
      }),
    init: () =>
      set((state) => {
        initGame(state);
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
    discardCard: () =>
      set((state) => {
        discardCard(state);
      }),
    learnCard: (cardID: string) =>
      set((state) => {
        learnCard(state, cardID);
      }),
    acknowledgeCard: () =>
      set((state) => {
        acknowledgeCard(state);
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
