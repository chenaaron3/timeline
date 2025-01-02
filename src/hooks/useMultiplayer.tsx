import throttle from 'lodash/throttle';
import Pusher, { Channel } from 'pusher-js';
import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '~/state';
import { api } from '~/utils/api';

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

type MessageTypes = 'stageCard' | 'setInsertionIntent';

export const useMutliplayer = (channelID: string) => {
    // API
    const sendMutation = api.multiplayer.sendMessage.useMutation()

    // Mutators
    const stageCard = useGameStore.use.stageCard();
    const setInsertionIntent = useGameStore.use.setInsertionIntent();

    // Local State
    const [channel, setChannel] = useState<Channel | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // For single player use cases
    if (!channelID) {
        return {
            isConnected: true,
            stageCard: stageCard,
            setInsertionIntent: setInsertionIntent,
        }
    }

    // Unsubscribe from the channel when the component unmounts
    useEffect(() => {
        const newChannel = pusher.subscribe(channelID);
        setChannel(newChannel)

        // Bind to events
        pusher.connection.bind('connected', () => {
            console.log("Connected to channel", channelID);
            setIsConnected(true);
        });

        newChannel.bind('stageCard', function (data: { message: string }) {
            console.log("Got stagedCard message from channel!", channelID, data.message);
        });


        newChannel.bind('setInsertionIntent', function (data: { message: string }) {
            console.log("Got setInsertionIntent message from channel!", channelID, data.message);
        });

        return () => {
            console.log("Unsubscribing from channel", channelID);
            newChannel.unsubscribe();
        }
    }, [channelID])

    // Certain actions should also send a message to the channel
    const multiplayerStageCard = (index: number) => {
        stageCard(index);
        sendMutation.mutate({
            channelID,
            event: 'stageCard' as MessageTypes,
            message: JSON.stringify({
                index,
            }),
        });
    }

    // Only sync once a second
    const syncInsertionIntent = useMemo(
        () =>
            throttle((index: number | null) => {
                sendMutation.mutate({
                    channelID,
                    event: 'setInsertionIntent' as MessageTypes,
                    message: JSON.stringify({
                        index,
                    }),
                });
            }, 1000),
        []
    );

    const multiplayerSetInsertionIntent = (index: number | null) => {
        // Local update does not need to be throttled
        setInsertionIntent(index);
        // Limit the number of messages we are sending
        syncInsertionIntent(index);
    }

    return {
        isConnected,
        stageCard: multiplayerStageCard,
        setInsertionIntent: multiplayerSetInsertionIntent,
    }
}