import { UserData } from './types';

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

export function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}
