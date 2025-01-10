import { useEffect } from 'react';
import { toast } from 'sonner';
import { useGameStore, useMultiplayerStore } from '~/state';

export const useAnnouncer = () => {
    // Selectors
    const deck = useGameStore.use.deck();
    const playerID = useMultiplayerStore.use.playerID();
    const players = useMultiplayerStore.use.players();
    const gameStarted = useMultiplayerStore.use.gameStarted();
    const joinedLobby = useMultiplayerStore.use.joinedLobby();

    const turnIndex = (deck.length % players.length)
    const isMyTurn = playerID == turnIndex + 1

    useEffect(() => {
        if (joinedLobby && gameStarted) {
            let message;
            if (isMyTurn) {
                message = "It's your turn to play a card!"
                toast.success(message, {
                    richColors: true,
                })
            } else {
                message = `It's ${players[turnIndex]}'s turn to play a card!`
                toast.info(message)
            }
        }
    }, [turnIndex, joinedLobby, gameStarted])
}