import { useEffect, useState } from 'react';
import { useGameStore, useMultiplayerStore } from '~/state';
import { pusher } from '~/utils/pusher';
import {
    BaseMessage, MessageTypes, OnGameStartedMessage, OnPlayerJoinMessage, SetInsertionIntentMessage,
    StageCardMessage
} from '~/utils/types';

import { useAnnouncer } from './useAnnouncer';

export const useMultiplayerSubscriptions = () => {
    // Selectors
    const lobbyID = useMultiplayerStore.use.lobbyID();
    const playerID = useMultiplayerStore.use.playerID();

    // Mutators
    const setPlayers = useMultiplayerStore.use.setPlayers();
    const stageCard = useGameStore.use.stageCard();
    const setInsertionIntent = useGameStore.use.setInsertionIntent();
    const startGame = useMultiplayerStore.use.startGame();
    const setJoinedLobby = useMultiplayerStore.use.setJoinedLobby();

    // Local State
    const [currentSubscription, setCurrentSubscription] = useState("")

    useAnnouncer();

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
                startGame();
            }
        })

        return () => {
            console.log("Unsubscribing from channel", lobbyID);
            newChannel.unsubscribe();
            newChannel.unbind_all();
        }
    }, [lobbyID])

}