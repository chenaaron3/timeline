import { LayoutGroup } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useGameStore } from '~/state';
import { compareEvent } from '~/utils/utils';

import {
    Active, closestCenter, DndContext, DragEndEvent, DragMoveEvent, DragStartEvent, Over,
    PointerSensor, TouchSensor, useSensor, useSensors
} from '@dnd-kit/core';

import { PlayingArea } from './PlayingArea';
import { Timeline } from './Timeline';

export const Board: React.FC = () => {
    const deckName = useGameStore.use.deckName();
    const playedCards = useGameStore.use.playedCards();
    const activeCard = useGameStore.use.activeCard();
    const stageCard = useGameStore.use.stageCard();
    const playCard = useGameStore.use.playCard();
    const discardCard = useGameStore.use.discardCard();
    const learnCard = useGameStore.use.learnCard();
    const stagedCard = useGameStore((state) => state.stagedCard);
    const discardedCards = useGameStore.use.discardedCards();

    const [draggingCard, setDraggingCard] = useState<string | null>(null);
    const [insertionIntent, setInsertionIntent] = useState<number | null>(null);
    const [incorrectMove, setIncorrectMove] = useState<boolean>(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor)
    );

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

    useEffect(() => {
        // When a new card is discarded, open it for learning
        if (discardedCards.length > 0) {
            const lastDiscarded = discardedCards[discardedCards.length - 1];
            if (lastDiscarded) {
                setTimeout(() => {
                    learnCard(lastDiscarded.id);
                }, 500)
            }
        }
    }, [discardedCards])

    useEffect(() => {
        // When the deck changes, reset the local state
        setDraggingCard(null);
        setInsertionIntent(null);
    }, [deckName]);

    return (<div className='flex flex-col items-center w-full h-full overflow-x-auto justify-evenly'
        style={{
            scrollbarWidth: 'none',
        }}>
        <LayoutGroup>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragMove={handleDragMove}
                onDragAbort={handleDragCancel}
                onDragCancel={handleDragCancel}
            >
                {/* Render the timeline */}
                <Timeline incorrectCard={incorrectMove ? stagedCard?.id : undefined} draggingCard={draggingCard} insertionIntent={insertionIntent} />
                {/* Render the active card */}
                <PlayingArea activeCard={activeCard} draggingCard={draggingCard} />
            </DndContext>
        </LayoutGroup>
    </div >
    );

    // DND Hooks
    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        setDraggingCard(active.id as string);
    }

    function handleDragMove(event: DragMoveEvent) {
        const { active, over } = event;

        // Do not do anything if not dragging upwards from the start
        if (!over || !inPlayingField(active)) {
            setInsertionIntent(null);
            return
        }

        // Update where we want to place the card
        const insertionIndex = getInsertionIndex(active, over)
        setInsertionIntent(insertionIndex);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        // There will always be an over since we are using closestCenter
        if (!activeCard || !over || !inPlayingField(active)) {
            setDraggingCard(null);
            setInsertionIntent(null);
            return
        }

        // Check if the card is placed in the correct position
        const insertionIndex = getInsertionIndex(active, over)
        stageCard(insertionIndex);

        // Stop dragging the card
        setDraggingCard(null);
        // Reset the insertion intent
        setInsertionIntent(null);
    }

    function handleDragCancel() {
        // Reset the dragging card in case we ever lose it
        setDraggingCard(null);
        setInsertionIntent(null);
    }

    // Helper Logic
    function getInsertionIndex(active: Active, over: Over) {
        // Get the mouse's x position
        const mouseX = (active.rect.current.translated!.left + active.rect.current.translated!.right) / 2;
        // Get the target card's x position
        const targetX = (over.rect.left + over.rect.right) / 2

        // Get the target card's index
        const targetIndex = playedCards.findIndex(card => card.id === over.id);

        // Dropped to the right of target
        if (mouseX > targetX) {
            return targetIndex + 1;
        } else {
            // Dropped to the left of target
            return targetIndex;
        }
    }

    function inPlayingField(active: Active) {
        // Do not do anything if not dragging upwards from the start
        return active.rect.current.initial!.top > active.rect.current.translated!.top + 50;
    }
}