import { chunk } from 'lodash';

import { Event, HighscoreCategory, Highscores, UserData } from './types';

function seededRandom(seed: number): () => number {
  return function () {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
}

export function shuffle<T>(array: T[], seed: number): T[] {
  const random = seededRandom(seed);
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    if (array[i] !== undefined && array[j] !== undefined) {
      const temp = array[i]!;
      array[i] = array[j]!;
      array[j] = temp;
    }
  }
  return array;
}

export function sample<T>(array: T[], count: number, seed: number): T[] {
  const random = seededRandom(seed);

  // Ensure count is less than or equal to the array length
  count = Math.min(count, array.length);

  // Determine chunk size
  const chunkSize = Math.ceil(array.length / count);
  const samples: T[] = [];

  // Divide array into chunks and pick one random element from each
  chunk(array, chunkSize).forEach((chunk) => {
    const i = Math.floor(random() * chunk.length);
    samples.push(chunk[i]!);
  });

  // If not enough samples, pick additional unique cards
  while (samples.length < count) {
    // Filter out already selected samples
    const remaining = array.filter((item) => !samples.includes(item));
    if (remaining.length === 0) break;

    const i = Math.floor(random() * remaining.length);
    samples.push(remaining[i]!);
  }

  // Scramble the samples before returning
  return shuffle<T>(samples, seed);
}

export function setSubtract<T>(setA: Set<T>, setB: Set<T>) {
  return new Set([...setA].filter((x) => !setB.has(x)));
}

export function areSetsEqual<T>(setA: Set<T>, setB: Set<T>) {
  if (setA.size !== setB.size) {
    return false; // Different sizes mean the sets are not equal
  }

  for (const item of setA) {
    if (!setB.has(item)) {
      return false; // If any item in setA is not in setB, they're not equal
    }
  }

  return true; // All items match
}

export function getUserData(): UserData {
  const userData = localStorage.getItem("userData");
  if (userData) {
    return JSON.parse(userData) as UserData;
  } else {
    return { highScores: {} };
  }
}

export function saveUserData(userData: UserData) {
  localStorage.setItem("userData", JSON.stringify(userData));
}

// Save and return the new high scores
export function saveHighScore(
  deckName: string,
  deckSize: number,
  category: HighscoreCategory,
  score: number,
): Highscores {
  const userData = getUserData();
  const highScores = userData.highScores;
  const highScoreKey = `${deckName}-${deckSize}`;
  if (!highScores[highScoreKey]) {
    highScores[highScoreKey] = {};
  }
  highScores[highScoreKey][category] = score;
  saveUserData(userData);
  return highScores[highScoreKey];
}

export function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Compare method to compare event dates
export function compareEvent(a: Event, b: Event): number {
  // First compare by rank
  if (a.rank < b.rank) return -1; // `this` is earlier
  if (a.rank > b.rank) return 1; // `this` is later
  return 0; // `this` is the same as `other`
}

export function generateUniqueID(): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const idLength = 6;
  let uniqueId = "";

  for (let i = 0; i < idLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueId += characters[randomIndex];
  }

  return uniqueId;
}

export function prettyPrintNumber(num: number) {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + "B";
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  } else if (num >= 10_000) {
    return (num / 1_000).toFixed(1) + "K";
  } else {
    return num.toString();
  }
}
