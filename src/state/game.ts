import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { DECK_NAMES, DISPLAY_DECKS } from '~/utils/constants';
import { areSetsEqual, setSubtract, shuffle } from '~/utils/utils';

import { Event, Events, ImageMap } from '../utils/types';

type GameState = {
  // Deck State
  deckName: DECK_NAMES;
  deckSize: number;
  deck: Events;
  cardMap: Record<string, Event>;

  // Board State
  activeCard: Event | undefined; // The card that is in hand, bottom row
  displayedCard: Event | undefined; // The card that is displayed in the modal
  stagedCard?: Event; // The last played card that is being evaluated for correctness
  playedCards: Events; // A list of correctly played cards
  discardedCards: Events; // A list of incorrectly played cards
  insertionIntent: number | null; // The index where the staged card is being dragged to

  // Scoreboard
  score: { correct: number; incorrect: number };
  time: number;
  streak: number;
  longestStreak: number;
  seed: number;
};

type GameActions = {
  init: (
    deckName?: string,
    deckSize?: number,
    deckDraws?: number,
    seed?: number,
  ) => void;
  selectDeck: (deckName: DECK_NAMES) => void;
  drawCard: () => void;
  stageCard: (index: number) => void;
  playCard: () => void;
  learnCard: (cardID: string) => void;
  discardCard: () => void;
  acknowledgeCard: () => void;
  setTime: (time: number) => void;
  setDeckSize: (deckSize: number) => void;
  setInsertionIntent: (insertionIntent: number | null) => void;
  setSeed: (seed: number) => void;
};

// Get deck by name and perform validation
const getDeck = (deckName: DECK_NAMES): Events => {
  console.log("Getting deck", deckName);
  const deck = DISPLAY_DECKS.find((deck) => deck.id === deckName)!;
  let imageMap = deck.imageMap;
  let deckData = deck.deckData;

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
const initGame = (state: GameState, deckDraws = 1) => {
  // Don't know which deck to load
  if (state.deckName == "NULL_DECK") {
    return;
  }
  // Get the deck data and image map
  const deckData = getDeck(state.deckName);
  // Shuffle the deck
  const shuffledDeck = shuffle(deckData, state.seed);
  // Sample a subset of cards from the deck so the game can end
  const sampledDeck = shuffledDeck.slice(0, state.deckSize);
  console.log(state.deckSize);

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
  state.playedCards = [];
  for (let i = 0; i < deckDraws; i++) {
    state.playedCards.push(sampledDeck.pop()!);
  }
  state.playedCards.sort((a, b) => a.year - b.year);
  state.discardedCards = [];
  state.deck = sampledDeck;
  state.time = 0;
  state.score = { correct: 1, incorrect: 0 };
  state.streak = 0;
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

// Stages the active card into the field
const stageCard = (state: GameState, index: number) => {
  // Stage the active card onto the playing field
  state.playedCards.splice(index, 0, state.activeCard!);
  state.stagedCard = state.activeCard;
  // Clear the active card
  state.activeCard = undefined;
  state.insertionIntent = null;
};

// Commites the active card into the field
const playCard = (state: GameState) => {
  // Clear the staging area for the next card
  state.stagedCard = undefined;

  // Keep track of score
  state.score.correct += 1;
  state.streak += 1;
  state.longestStreak = Math.max(state.streak, state.longestStreak);
  drawCard(state);
};

// Discards the card into the discard pile
const discardCard = (state: GameState) => {
  if (!state.stagedCard) {
    throw new Error("Cannot discard a card that is not staged");
  }
  // Take out the staged card and place it in the discard pile
  // Also learn about it
  state.playedCards = state.playedCards.filter(
    (card) => card.id != state.stagedCard!.id,
  );
  state.discardedCards.push(state.stagedCard);
  state.stagedCard = undefined;

  // Keep track of score
  state.score.incorrect += 1;
  state.streak = 0;
};

export const gameStore = create<GameState & GameActions>()(
  subscribeWithSelector(
    immer((set) => ({
      deckName: "NULL_DECK",
      deckSize: 20,
      deck: [] as Events,
      cardMap: {} as Record<string, Event>,
      activeCard: undefined as Event | undefined,
      displayedCard: undefined as Event | undefined,
      playedCards: [] as Events,
      discardedCards: [] as Events,
      score: { correct: 0, incorrect: 0 },
      time: 0,
      streak: 0,
      longestStreak: 0,
      insertionIntent: null,
      seed: Math.random(),
      lobbyOpen: false,
      selectDeck: (deckName: DECK_NAMES) =>
        set((state) => {
          state.deckName = deckName;
          initGame(state);
        }),
      init: (
        deckName?: string,
        deckSize?: number,
        deckDraws?: number,
        seed?: number,
      ) =>
        set((state) => {
          if (deckName != undefined) {
            state.deckName = deckName as DECK_NAMES;
          }
          if (deckSize != undefined) {
            state.deckSize = deckSize;
          }
          if (seed != undefined) {
            state.seed = seed;
          } else {
            state.seed = Math.random();
          }
          initGame(state, deckDraws);
        }),
      drawCard: () => {
        set((state) => {
          drawCard(state);
        });
      },
      stageCard: (index: number) =>
        set((state) => {
          stageCard(state, index);
        }),
      playCard: () =>
        set((state) => {
          playCard(state);
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
      setTime: (time: number) =>
        set((state) => {
          state.time = time;
        }),
      setDeckSize: (deckSize: number) =>
        set((state) => {
          state.deckSize = deckSize;
          initGame(state);
        }),
      setInsertionIntent: (insertionIntent: number | null) =>
        set((state) => {
          state.insertionIntent = insertionIntent;
        }),
      setSeed: (seed: number) =>
        set((state) => {
          state.seed = seed;
        }),
    })),
  ),
);

// Game is complete if the deck is empty and atleast one card has been played
export const isGameComplete = (s: GameState) =>
  s.playedCards.length > 0 &&
  s.activeCard == undefined &&
  s.stagedCard == undefined &&
  s.deck.length == 0;
