export type Events = Event[];

export interface Event {
  id: string;
  title: string;
  year: int;
  date: string;
  country: string;
  division: string;
  description: string;
  longDescription: string;
  imagePrompt: string;
  image?: StaticImageData;
}

// Maps the event id to the imported image
export type ImageMap = Record<string, StaticImageData>;
