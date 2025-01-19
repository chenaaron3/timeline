import { BookText, Boxes, CircleHelp, RotateCcw, Ruler, Settings, UserPlus2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { toast } from 'sonner';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub,
    DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import { SimpleTooltip } from '~/components/ui/simple-tooltip';
import { useGameStore, useMultiplayerStore } from '~/state';
import { DECK_NAMES, DISPLAY_DECKS } from '~/utils/deckCollection';

const deckSizes = [
    { count: 5 },
    { count: 10 },
    { count: 20 },
    { count: 40 },
    { count: 80 },
]

export function Menu() {
    const router = useRouter();
    const setDeckSize = useGameStore.use.setDeckSize();
    const selectDeck = useGameStore.use.selectDeck();
    const currentDeck = useGameStore.use.deckName();
    const currentDeckSize = useGameStore.use.deckSize();
    const setLobbyOpen = useMultiplayerStore.use.setLobbyOpen();
    const init = useGameStore.use.init();

    const onSelectDeck = (deckName: DECK_NAMES) => {
        selectDeck(deckName);
    }

    const onViewBlog = (deckName: DECK_NAMES) => {
        router.push('/posts/' + deckName); // Replace with your target route
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
        <div className='fixed flex gap-5 bottom-5 left-5 flex-col sm:flex-row sm:top-3 sm:right-3 sm:static'>
            <SimpleTooltip description='How To Play?'>
                <div className='cursor-pointer' onClick={() => {
                    const deckData = DISPLAY_DECKS.find((deck) => deck.id === currentDeck)
                    if (deckData) {
                        toast(deckData.instruction, {
                            position: "top-center",
                            icon: <CircleHelp />,
                        })
                    }
                }}>
                    <CircleHelp />
                </div>
            </SimpleTooltip>
            {/* <SimpleTooltip description='Provide Feedback'>
                <Feedback />
            </SimpleTooltip> */}
            <SimpleTooltip description='Multiplayer'>
                <div className='cursor-pointer' onClick={() => setLobbyOpen(true)}>
                    <UserPlus2 />
                </div>
            </SimpleTooltip>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Settings />
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
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <BookText />
                                <span>Learn More</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    {
                                        DISPLAY_DECKS.map((deck) => {
                                            if (deck.blogData) {
                                                return (
                                                    <DropdownMenuItem key={deck.id} onClick={() => onViewBlog(deck.id)}>
                                                        {deck.icon}
                                                        <span>
                                                            {deck.name}
                                                        </span>
                                                    </DropdownMenuItem>
                                                )
                                            } else {
                                                return <></>
                                            }
                                        })
                                    }
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
