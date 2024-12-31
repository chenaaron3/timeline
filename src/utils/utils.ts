import { Event, HighscoreCategory, Highscores, UserData } from './types';

export function shuffle<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    if (array[i] !== undefined && array[j] !== undefined) {
      const temp = array[i]!;
      array[i] = array[j]!;
      array[j] = temp;
    }
  }
  return array;
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
  // First compare by year
  if (a.year < b.year) return -1; // `this` is earlier
  if (a.year > b.year) return 1; // `this` is later

  // If years are the same, use the more unreliable date
  const thisDate = new Date(a.date).getTime();
  const otherDate = new Date(b.date).getTime();

  if (thisDate < otherDate) return -1; // `this` is earlier
  if (thisDate > otherDate) return 1; // `this` is later
  return 0; // `this` is the same as `other`
}
