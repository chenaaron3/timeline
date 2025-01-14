import { LayoutGroup } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useGame } from '~/hooks/useGame';
import { useMultiplayerControls } from '~/hooks/useMultiplayerControls';
import { useMultiplayerSubscriptions } from '~/hooks/useMultiplayerSubscriptions';
import { useGameStore, useMultiplayerStore } from '~/state';

import {
    Active, closestCenter, DndContext, DragEndEvent, DragMoveEvent, DragStartEvent, Over,
    PointerSensor, TouchSensor, useSensor, useSensors
} from '@dnd-kit/core';

import { PlayingArea } from './PlayingArea';
import { Timeline } from './Timeline';

export const Board: React.FC = () => {
    // Selectors
    const activeCard = useGameStore.use.activeCard();
    const deckName = useGameStore.use.deckName();
    const playedCards = useGameStore.use.playedCards();
    const stagedCard = useGameStore((state) => state.stagedCard);
    const joinedLobby = useMultiplayerStore.use.joinedLobby();
    const gameStarted = useMultiplayerStore.use.gameStarted();

    // Local State
    const [draggingCard, setDraggingCard] = useState<string | null>(null);

    // Custom Hooks
    const { incorrectMove } = useGame()
    // Should only have 1 instance so subscriptions are not duped
    useMultiplayerSubscriptions();
    const { setInsertionIntent, stageCard } = useMultiplayerControls();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor)
    );

    useEffect(() => {
        // When the deck changes, reset the local state
        setDraggingCard(null);
        setInsertionIntent(null);
    }, [deckName]);

    return (
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
                <Timeline incorrectCard={incorrectMove ? stagedCard?.id : undefined} />
                {/* Render the active card, disable if multiplayer */}
                <PlayingArea activeCard={activeCard} draggingCard={draggingCard} disabled={joinedLobby && !gameStarted} />
            </DndContext>
        </LayoutGroup>
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