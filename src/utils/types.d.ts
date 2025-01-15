export type Events = Event[];

export interface Event {
  id: string;
  title: string;
  rank: number;
  description: string;
  longDescription: string;
  imagePrompt: string;
  imageURL?: string;
  // eslint-disable-next-line
  image?: StaticImageData | string; // This is a derived column
  compareTo(other: Event): number;
  [key: string]: number; // Each event can have custom stats
}

// Event types
export type MessageTypes =
  | "stageCard"
  | "setInsertionIntent"
  | "onPlayerJoin"
  | "onGameStarted";

export interface BaseMessage {
  playerID: number;
}

export interface StageCardMessage extends BaseMessage {
  index: number;
}

export interface SetInsertionIntentMessage extends BaseMessage {
  index: number;
}

export interface OnPlayerJoinMessage extends BaseMessage {
  playerNames: string[];
}

export interface OnGameStartedMessage extends BaseMessage {
  turn: number;
}

// Maps the event id to the imported image
export type ImageMap = Record<string, StaticImageData>;

export interface Highscores {
  accuracy?: number;
  time?: number;
  streak?: number;
}
export type HighscoreCategory = keyof Highscores;

export interface UserData {
  // Stores high scores based on deck size
  // eslint-disable-next-line
  highScores: {
    [key: string]: Highscores;
  };
}
