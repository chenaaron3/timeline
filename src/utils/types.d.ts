export type Deck = Event[];

export interface Event{
    id: string
    title: string
    year: int
    date: string
    country: string
    division: string
    description: string
    longDescription: string
    imagePrompt: string
}