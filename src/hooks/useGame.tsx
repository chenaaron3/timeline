import { CircleHelp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useGameStore } from '~/state';
import { DISPLAY_DECKS } from '~/utils/deckCollection';
import { compareEvent } from '~/utils/utils';

export const useGame = () => {
    // Selectors
    const stagedCard = useGameStore((state) => state.stagedCard);
    const playedCards = useGameStore.use.playedCards();
    const discardedCards = useGameStore.use.discardedCards();
    const deckName = useGameStore.use.deckName();

    // Mutators
    const playCard = useGameStore.use.playCard();
    const discardCard = useGameStore.use.discardCard();
    const learnCard = useGameStore.use.learnCard();
    const drawCard = useGameStore.use.drawCard();

    // Local State
    const [incorrectMove, setIncorrectMove] = useState<boolean>(false);

    useEffect(() => {
        // Display welcome message
        const deckData = DISPLAY_DECKS.find((deck) => deck.id === deckName)
        if (deckData) {
            toast(deckData.instruction, {
                position: "top-center",
                icon: <CircleHelp />,
                richColors: true,
            })
        }
    }, [deckName])

    // When a new card is placed, check if it is in the correct position
    useEffect(() => {
        if (stagedCard) {
            const insertionIndex = playedCards.findIndex(card => card.id === stagedCard.id);

            let validPlacement = true;
            const leftNeighbor = playedCards[insertionIndex - 1];
            const rightNeighbor = playedCards[insertionIndex + 1];
            if (leftNeighbor) {
                if (compareEvent(stagedCard, leftNeighbor) < 0) {
                    validPlacement = false;
                }
            }
            if (rightNeighbor) {
                if (compareEvent(stagedCard, rightNeighbor) > 0) {
                    validPlacement = false;
                }
            }

            if (validPlacement) {
                playCard();
            } else {
                // Display incorrect screen for a bit
                setIncorrectMove(true);
                setTimeout(() => {
                    discardCard();
                    setIncorrectMove(false);
                }, 1000)
            }
        }
    }, [stagedCard, playedCards])

    // When a new card is discarded, open it for learning
    useEffect(() => {
        if (discardedCards.length > 0) {
            const lastDiscarded = discardedCards[discardedCards.length - 1];
            if (lastDiscarded) {
                setTimeout(() => {
                    // learnCard(lastDiscarded.id);
                    drawCard();
                }, 500)
            }
        }
    }, [discardedCards])

    return { incorrectMove }
}