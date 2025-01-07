import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useGameStore, useMultiplayerStore } from '~/state';
import { api } from '~/utils/api';
import {
    BaseMessage, MessageTypes, OnGameStartedMessage, OnPlayerJoinMessage, SetInsertionIntentMessage,
    StageCardMessage
} from '~/utils/types';

import { useThrottle } from './useThrottle';

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

export const useMultiplayer = (lobbyID: string | null, playerID: number | null) => {
    // API
    const sendMutation = api.multiplayer.sendMessage.useMutation()

    // Selectors
    const deck = useGameStore.use.deck();
    const players = useMultiplayerStore.use.players();
    const gameStarted = useMultiplayerStore.use.gameStarted();
    const setGameStarted = useMultiplayerStore.use.setGameStarted();

    // Mutators
    const setPlayers = useMultiplayerStore.use.setPlayers();
    const stageCard = useGameStore.use.stageCard();
    const setInsertionIntent = useGameStore.use.setInsertionIntent();
    const setLobbyOpen = useMultiplayerStore.use.setLobbyOpen();

    // Local State
    const [joinedLobby, setJoinedLobby] = useState(false);
    const [currentSubscription, setCurrentSubscription] = useState("")

    const turnIndex = (deck.length % players.length)
    const isMyTurn = playerID == turnIndex + 1

    const startGame = () => {
        setLobbyOpen(false);
        setGameStarted(true);
    }

    useEffect(() => {
        if (joinedLobby && gameStarted) {
            let message;
            if (isMyTurn) {
                message = "It's your turn to play a card!"
            } else {
                message = `It's ${players[turnIndex]}'s turn to play a card!`
            }
            toast.info(message)
        }
    }, [turnIndex, joinedLobby, gameStarted])

    useEffect(() => {
        // Player is ready if they are subscribed and have ids ready
        if (lobbyID != null && playerID != null && lobbyID == currentSubscription) {
            setJoinedLobby(true);
        } else {
            setJoinedLobby(false);
        }
    }, [currentSubscription, lobbyID, playerID])

    // Unsubscribe from the channel when the component unmounts
    useEffect(() => {
        // Multiplayer is only valid if both are present
        if (lobbyID == null) {
            console.log("Detected lobby change", lobbyID)
            return;
        }

        const newChannel = pusher.subscribe(lobbyID);
        // Once subscription succeeds, can start sending messages
        newChannel.bind("pusher:subscription_succeeded", () => {
            console.log("Connected to channel!", lobbyID);
            setCurrentSubscription(lobbyID)
        });

        function handleMessage<T extends BaseMessage>(
            messageType: MessageTypes,
            callback: (m: T) => void
        ) {
            // Prevent double bindings
            newChannel.unbind(messageType)
            newChannel.bind(messageType, function (data: { message: T }) {
                // parses the data out of the message
                const parsedMessage = data.message
                console.log(`Got ${messageType} message from channel!`, lobbyID, parsedMessage);
                if (parsedMessage.playerID != playerID) {
                    callback(parsedMessage)
                } else {
                    console.log("Discarding message since it came from me")
                }
            })
        }

        handleMessage<OnPlayerJoinMessage>('onPlayerJoin', (m) => {
            console.log("Found new players", m.playerNames)
            setPlayers(m.playerNames)
        })

        handleMessage<StageCardMessage>('stageCard', (m) => {
            if (m.playerID != playerID) {
                console.log("Someone staged a card at", m.index)
                stageCard(m.index)
            }
        })

        handleMessage<SetInsertionIntentMessage>('setInsertionIntent', (m) => {
            if (m.playerID != playerID) {
                console.log("Someone sent an intent at", m.index)
                setInsertionIntent(m.index)
            }
        })

        handleMessage<OnGameStartedMessage>('onGameStarted', (m) => {
            if (m.playerID != playerID) {
                console.log("Owner started the game!")
                startGame()
            }
        })

        return () => {
            console.log("Unsubscribing from channel", lobbyID);
            newChannel.unsubscribe();
            newChannel.unbind_all();
        }
    }, [lobbyID])

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
    }, 250, [sendMutation, lobbyID])

    // For single player use cases
    if (lobbyID == null || playerID == null) {
        return {
            joinedLobby: false,
            gameStarted: true,
            isMyTurn: true,
            players: [],
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
        joinedLobby,
        players,
        gameStarted,
        isMyTurn,
        stageCard: multiplayerStageCard,
        setInsertionIntent: multiplayerSetInsertionIntent,
        startGame: multiplayerStartGame,
    }
}