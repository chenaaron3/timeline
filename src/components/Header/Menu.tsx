import { Boxes, Menu as MenuIcon, PlusCircle, RotateCcw, Ruler, UserPlus2 } from 'lucide-react';
import { useEffect } from 'react';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub,
    DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import { useGameStore } from '~/state';
import { DECK_NAMES, DISPLAY_DECKS } from '~/utils/constants';

import { Feedback } from './Feedback';

const deckSizes = [
    { count: 5 },
    { count: 10 },
    { count: 20 },
    { count: 40 },
    { count: 80 },
]

export function Menu() {
    const setDeckSize = useGameStore.use.setDeckSize();
    const selectDeck = useGameStore.use.selectDeck();
    const currentDeck = useGameStore.use.deckName();
    const currentDeckSize = useGameStore.use.deckSize();
    const init = useGameStore.use.init();

    const onSelectDeck = (deckName: DECK_NAMES) => {
        selectDeck(deckName);
    }

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            const { key, ctrlKey, shiftKey } = event;

            // Example shortcuts
            if (shiftKey && key === "R") {
                init();
            }
        };

        // Attach event listener
        window.addEventListener("keydown", handleKeyPress);

        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, []);

    return (
        <div className='absolute flex gap-5 top-3 right-3 sm:static'>
            <Feedback />
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <MenuIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => init()}>
                            <RotateCcw />
                            <span>Restart</span>
                            <DropdownMenuShortcut>⇧R</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Ruler />
                                <span>Deck Size</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    {
                                        deckSizes.map((deckSize) => (
                                            <DropdownMenuItem
                                                disabled={deckSize.count === currentDeckSize}
                                                key={deckSize.count}
                                                onClick={() => setDeckSize(deckSize.count)}>
                                                {/* {deck.icon} */}
                                                <span>
                                                    {`${deckSize.count} Cards`}
                                                </span>
                                            </DropdownMenuItem>
                                        ))
                                    }
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Boxes />
                                <span>Browse Decks</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    {
                                        DISPLAY_DECKS.map((deck) => (
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>
                            <UserPlus2 />
                            <span>Invite Player (Soon!)</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
