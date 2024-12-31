export type Events = Event[];

export interface Event {
  id: string;
  title: string;
  year: number;
  date: string;
  country: string;
  description: string;
  longDescription: string;
  imagePrompt: string;
  image?: StaticImageData;
  compareTo(other: Event): number;
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
