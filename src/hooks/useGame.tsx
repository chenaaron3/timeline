import { useEffect, useState } from 'react';
import { useGameStore } from '~/state';
import { compareEvent } from '~/utils/utils';

export const useGame = () => {
    // Selectors
    const stagedCard = useGameStore((state) => state.stagedCard);
    const playedCards = useGameStore.use.playedCards();
    const discardedCards = useGameStore.use.discardedCards();

    // Mutators
    const playCard = useGameStore.use.playCard();
    const discardCard = useGameStore.use.discardCard();
    const learnCard = useGameStore.use.learnCard();
    const drawCard = useGameStore.use.drawCard();

    // Local State
    const [incorrectMove, setIncorrectMove] = useState<boolean>(false);

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