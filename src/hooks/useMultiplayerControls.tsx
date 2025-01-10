import { toast } from 'sonner';
import { useGameStore, useMultiplayerStore } from '~/state';
import { api } from '~/utils/api';
import {
    MessageTypes, OnGameStartedMessage, SetInsertionIntentMessage, StageCardMessage
} from '~/utils/types';

import { useThrottle } from './useThrottle';

export const useMultiplayerControls = () => {
    // API
    const sendMutation = api.multiplayer.sendMessage.useMutation()

    // Selectors
    const deck = useGameStore.use.deck();
    const players = useMultiplayerStore.use.players();
    const lobbyID = useMultiplayerStore.use.lobbyID();
    const playerID = useMultiplayerStore.use.playerID();

    // Mutators
    const stageCard = useGameStore.use.stageCard();
    const setInsertionIntent = useGameStore.use.setInsertionIntent();
    const startGame = useMultiplayerStore.use.startGame();

    // Local State
    const turnIndex = (deck.length % players.length)
    const isMyTurn = playerID == turnIndex + 1

    // Only sync once a second
    const syncInsertionIntent = useThrottle((index: number | null) => {
        // Only send message if it is changing positions
        // Removing intent is done when a card is placed
        if (lobbyID != null) {
            sendMutation.mutate({
                lobbyID: lobbyID,
                event: 'setInsertionIntent' as MessageTypes,
                message: {
                    playerID: playerID,
                    index: index,
                } as SetInsertionIntentMessage,
            });
        }
    }, 750, [sendMutation, lobbyID])

    // For single player use cases
    if (lobbyID == null || playerID == null) {
        return {
            stageCard: stageCard,
            setInsertionIntent: setInsertionIntent,
            startGame: startGame,
        }
    }

    // Certain actions should also send a message to the channel
    const multiplayerStageCard = (index: number) => {
        if (!isMyTurn) {
            toast.error("It is not your turn yet!")
            return;
        }
        stageCard(index);
        sendMutation.mutate({
            lobbyID: lobbyID,
            event: 'stageCard' as MessageTypes,
            message: {
                playerID: playerID,
                index: index,
            } as StageCardMessage,
        });
    }

    const multiplayerSetInsertionIntent = (index: number | null) => {
        if (!isMyTurn) {
            // Don't show anything
            return;
        }
        // Local update does not need to be throttled
        setInsertionIntent(index);
        // Limit the number of messages we are sending
        syncInsertionIntent(index);
    }

    const multiplayerStartGame = () => {
        sendMutation.mutate({
            lobbyID: lobbyID,
            event: 'onGameStarted' as MessageTypes,
            message: {
                playerID: playerID,
            } as OnGameStartedMessage,
        });
        startGame();
    }

    return {
        stageCard: multiplayerStageCard,
        setInsertionIntent: multiplayerSetInsertionIntent,
        startGame: multiplayerStartGame,
    }
}