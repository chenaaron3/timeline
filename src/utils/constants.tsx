import { Earth, EarthLock, User } from 'lucide-react';
import OldWorldHistoryData from '~/data/old_world_history.json';
import USPresidents from '~/data/us_president_inaugurations.json';
import WorldHistoryData from '~/data/world_history.json';
import { IMAGE_MAP as oldWorldHistoryImageMap } from '~/generated/OldWorldHistoryImages';
import { IMAGE_MAP as usPresidentsImageMap } from '~/generated/UsPresidentInaugurationsImages';
import { IMAGE_MAP as worldHistoryImageMap } from '~/generated/WorldHistoryImages';

import { Events, ImageMap } from './types';

export type DECK_NAMES = "world_history" | "old_world_history" | "us_presidents" | "";

interface DisplayDecks {
    id: DECK_NAMES;
    name: string;
    icon: React.ReactNode;
    imageMap: ImageMap;
    deckData: Events;
}

export const DISPLAY_DECKS = [
    {
        id: 'world_history',
        name: 'World History',
        icon: <Earth />,
        imageMap: worldHistoryImageMap,
        deckData: WorldHistoryData,
    },
    {
        id: 'old_world_history',
        name: 'World History (Hard)',
        icon: <EarthLock />,
        imageMap: oldWorldHistoryImageMap,
        deckData: OldWorldHistoryData,
    },
    {
        id: 'us_presidents',
        name: 'US Presidents',
        icon: <User />,
        imageMap: usPresidentsImageMap,
        deckData: USPresidents,
    },
] as DisplayDecks[];