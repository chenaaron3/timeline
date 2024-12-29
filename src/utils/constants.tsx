import { Earth, EarthLock } from 'lucide-react';
import { DECK_NAMES } from '~/state';

interface DisplayDecks {
    id: DECK_NAMES;
    name: string;
    icon: React.ReactNode;
}

export const DISPLAY_DECKS = [
    { id: 'world_history', name: 'World History', icon: <Earth /> },
    { id: 'old_world_history', name: 'World History (Hard)', icon: <EarthLock /> },
] as DisplayDecks[];