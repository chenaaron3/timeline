import { LayoutGroup } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { isGameComplete, useGameStore } from '~/state';
import { compareEvent } from '~/utils/utils';

import {
    Active, closestCenter, DndContext, DragEndEvent, DragMoveEvent, DragStartEvent, Over,
    PointerSensor, TouchSensor, useSensor, useSensors
} from '@dnd-kit/core';

import { PlayingArea } from './PlayingArea';
import { Results } from './Results';
import { Timeline } from './Timeline';

export const Board: React.FC = () => {
    const gameComplete = useGameStore(isGameComplete)
    const deckName = useGameStore.use.deckName();
    const playedCards = useGameStore.use.playedCards();
    const activeCard = useGameStore.use.activeCard();
    const playCard = useGameStore.use.playCard();
    const discardCard = useGameStore.use.discardCard();

    const [draggingCard, setDraggingCard] = useState<string | null>(null);
    const [insertionIntent, setInsertionIntent] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor)
    );

    useEffect(() => {
        // When the deck changes, reset the game
        setDraggingCard(null);
        setInsertionIntent(null);
    }, [deckName]);

    return (<div className='flex flex-col items-center flex-1 justify-evenly'>
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
                <Timeline draggingCard={draggingCard} insertionIntent={insertionIntent} />
                {/* Render the active card */}
                {activeCard && <PlayingArea activeCard={activeCard} draggingCard={draggingCard} />}
                {/* Render result screen if there is no more active card */}
                {gameComplete && <Results />}
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
        placeCard(insertionIndex);
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

    function placeCard(insertionIndex: number) {
        if (!activeCard) {
            return;
        }

        let validPlacement = true;
        const leftNeighbor = playedCards[insertionIndex - 1];
        const rightNeighbor = playedCards[insertionIndex];
        if (leftNeighbor) {
            if (compareEvent(activeCard, leftNeighbor) < 0) {
                validPlacement = false;
            }
        }
        if (rightNeighbor) {
            if (compareEvent(activeCard, rightNeighbor) > 0) {
                validPlacement = false;
            }
        }

        if (validPlacement) {
            // Play the card at the insertion index
            playCard(insertionIndex)
        } else {
            discardCard();
        }

        // Stop dragging the card
        setDraggingCard(null);
        // Reset the insertion intent
        setInsertionIntent(null);
    }
}