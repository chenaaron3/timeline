import { throttle } from 'lodash';
import Pusher from 'pusher-js';
import { useEffect, useMemo, useState } from 'react';
import { useGameStore, useMultiplayerStore } from '~/state';
import { api } from '~/utils/api';
import {
    BaseMessage, MessageTypes, OnPlayerJoinMessage, SetInsertionIntentMessage, StageCardMessage
} from '~/utils/types';

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

export const useMultiplayer = (lobbyID: string | null, playerID: number | null) => {
    // API
    const sendMutation = api.multiplayer.sendMessage.useMutation()

    const players = useMultiplayerStore.use.players();

    // Mutators
    const setPlayers = useMultiplayerStore.use.setPlayers();
    const stageCard = useGameStore.use.stageCard();
    const setInsertionIntent = useGameStore.use.setInsertionIntent();

    // Local State
    const [joinedLobby, setJoinedLobby] = useState(false);
    const [currentSubscription, setCurrentSubscription] = useState("")

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
            handleMessage: (m: T) => void
        ) {
            newChannel.bind(messageType, function (data: { message: T }) {
                if (data.message.playerID != playerID) {
                    // parses the data out of the message
                    console.log(`Got ${messageType} message from channel!`, lobbyID, data.message);
                    handleMessage(data.message)
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

        return () => {
            console.log("Unsubscribing from channel", lobbyID);
            newChannel.unsubscribe();
        }
    }, [lobbyID])

    // Only sync once a second
    const syncInsertionIntent = useMemo(
        () => {
            return throttle((index: number | null) => {
                // Only send message if it is changing positions
                // Removing intent is done when a card is placed
                if (lobbyID != null && index != null) {
                    sendMutation.mutate({
                        lobbyID: lobbyID,
                        event: 'setInsertionIntent' as MessageTypes,
                        message: JSON.stringify({
                            playerID: playerID,
                            index: index,
                        } as SetInsertionIntentMessage),
                    });
                }
            }, 1000)
        },
        [sendMutation, lobbyID]
    );

    // For single player use cases
    if (lobbyID == null || playerID == null) {
        return {
            joinedLobby: false,
            stageCard: stageCard,
            setInsertionIntent: setInsertionIntent,
        }
    }

    // Certain actions should also send a message to the channel
    const multiplayerStageCard = (index: number) => {
        stageCard(index);
        sendMutation.mutate({
            lobbyID: lobbyID,
            event: 'stageCard' as MessageTypes,
            message: JSON.stringify({
                playerID: playerID,
                index: index,
            } as StageCardMessage),
        });
    }

    const multiplayerSetInsertionIntent = (index: number | null) => {
        // Local update does not need to be throttled
        setInsertionIntent(index);
        // Limit the number of messages we are sending
        syncInsertionIntent(index);
    }

    return {
        joinedLobby,
        players,
        stageCard: multiplayerStageCard,
        setInsertionIntent: multiplayerSetInsertionIntent,
    }
}