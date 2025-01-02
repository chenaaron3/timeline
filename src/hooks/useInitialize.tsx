import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useGameStore } from '~/state';
import { api } from '~/utils/api';
import { DECK_NAMES, DISPLAY_DECKS } from '~/utils/constants';

export const useInitialize = () => {
    const router = useRouter();
    const joinLobby = api.multiplayer.joinLobby.useMutation();

    const init = useGameStore.use.init();
    const setPlayerIndex = useGameStore.use.setPlayerIndex();

    // Access query parameters from the router object
    const { query, isReady } = router;
    const lobby = query.lobby;
    const name = query.deck;
    const size = parseInt(query.size as string);
    const draws = parseInt(query.draws as string);

    useEffect(() => {
        const handleQueries = async () => {
            let deckName: DECK_NAMES | undefined;
            let deckSize: number | undefined;
            let deckDraws: number | undefined;
            let seed: number | undefined;

            // Check if lobby is in the query parameters
            if (lobby) {
                const lobbyResults = await joinLobby.mutateAsync({
                    lobbyID: lobby as string,
                    playerName: "Player2"
                })
                if (lobbyResults && lobbyResults.length > 0) {
                    const details = lobbyResults[0]!
                    deckName = details.deckName as DECK_NAMES
                    deckSize = details.deckSize
                    seed = parseFloat(details.seed)
                    setPlayerIndex((details.players as string[]).length - 1)
                }
            } else {
                // Check if deckSize is a number
                if (!isNaN(size) && size > 1) {
                    deckSize = size
                }

                // Check if deck name is in DISPLAY_DECKS
                if (name && DISPLAY_DECKS.find((deck) => deck.id === name)) {
                    deckName = name as DECK_NAMES
                } else {
                    deckName = "world_history"
                }

                // Check if deckDraws is a number
                if (!isNaN(draws) && draws > 1) {
                    deckDraws = draws
                }
            }
            init(deckName, deckSize, deckDraws, seed);
        }

        // Initalize the board once the query parameters are ready
        if (isReady) {
            handleQueries()
        }
    }, [isReady])
}