import {
    Boxes, Earth, EarthLock, Menu as MenuIcon, PlusCircle, RotateCcw, UserPlus2
} from 'lucide-react';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent,
    DropdownMenuSubTrigger, DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import { DECK_NAMES, useGameStore } from '~/state';

interface DisplayDecks {
    id: DECK_NAMES;
    name: string;
    icon: React.ReactNode;
}

const displayDecks = [
    { id: 'world_history', name: 'World History', icon: <Earth /> },
    { id: 'old_world_history', name: 'World History (Hard)', icon: <EarthLock /> },
] as DisplayDecks[];

export function Menu() {
    const selectDeck = useGameStore.use.selectDeck();
    const currentDeck = useGameStore.use.deckName();
    const init = useGameStore.use.init();

    const onSelectDeck = (deckName: DECK_NAMES) => {
        selectDeck(deckName);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <MenuIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={init}>
                        <RotateCcw />
                        <span>Restart</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <UserPlus2 />
                        <span>Invite Player</span>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Boxes />
                            <span>Browse Decks</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                {
                                    displayDecks.map((deck) => (
                                        <DropdownMenuItem disabled={deck.id === currentDeck} key={deck.id} onClick={() => onSelectDeck(deck.id)}>
                                            {deck.icon}
                                            <span>
                                                {deck.name}
                                            </span>
                                        </DropdownMenuItem>
                                    ))
                                }
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <PlusCircle />
                                    <span>More...</span>
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
