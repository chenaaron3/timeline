import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useGameStore, useMultiplayerStore } from '~/state';
import { DECK_NAMES, DISPLAY_DECKS } from '~/utils/constants';

export const useInitialize = () => {
    const router = useRouter();

    const init = useGameStore.use.init();
    const setLobbyOpen = useMultiplayerStore.use.setLobbyOpen();

    // Access query parameters from the router object
    const { query, isReady } = router;
    const lobby = query.lobby;
    const name = query.deck;
    const size = parseInt(query.size as string);
    const draws = parseInt(query.draws as string);

    useEffect(() => {
        // Initalize the board once the query parameters are ready
        if (isReady) {
            let deckName: DECK_NAMES | undefined;
            let deckSize: number | undefined;
            let deckDraws: number | undefined;
            let seed: number | undefined;

            // Check if lobby is in the query parameters
            if (lobby) {
                setLobbyOpen(true);
            } else {
                // Check if deckSize is a number
                if (!isNaN(size) && size > 1) {
                    deckSize = size
                }

                // Check if deckDraws is a number
                if (!isNaN(draws) && draws > 1) {
                    deckDraws = draws
                }
            }
            // Check if deck name is in DISPLAY_DECKS
            if (name && DISPLAY_DECKS.find((deck) => deck.id === name)) {
                deckName = name as DECK_NAMES
            } else {
                deckName = "world_history"
            }
            init(deckName, deckSize, deckDraws, seed);
        }
    }, [isReady])
}