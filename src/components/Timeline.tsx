import React, { useState } from 'react'

import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    type DragMoveEvent,
    type Active,
    type Over,
} from '@dnd-kit/core';
import {
    restrictToWindowEdges,
} from '@dnd-kit/modifiers';


import { Card } from './Card';
import { DraggableCard } from './DraggableCard';
import { DroppableCard } from './DroppableCard';
import { ShadowCard } from './ShadowCard';
import { useGameStore } from '~/state';

import { AnimatePresence, LayoutGroup } from 'framer-motion';

export const Timeline: React.FC = () => {
    const playedCards = useGameStore.use.playedCards();
    const activeCard = useGameStore.use.activeCard();
    const playCard = useGameStore.use.playCard();

    const [draggingCard, setDraggingCard] = useState<string | null>(null);
    const [insertionIntent, setInsertionIntent] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    if (!activeCard) {
        return <div>
            Cannot find active card!
        </div>;
    }

    const fieldElements = [];
    // loop through player cards and add elements to fieldelements
    for (let i = 0; i < playedCards.length; i++) {
        const card = playedCards[i]!;
        // Show preshadow if the intent is to place the card here
        const showPreshadow = draggingCard != null && insertionIntent === i;
        // Show postshadow if its the last card
        const showPostshadow = draggingCard != null && insertionIntent === i + 1 && i == playedCards.length - 1

        // Show shadow text for tutorial
        const showTutorial = playedCards.length == 1

        if (showTutorial || showPreshadow) {
            fieldElements.push(<ShadowCard key={"pre-shadow"} intent={showPreshadow} message={showTutorial ? "Before?" : ""} />)
        }
        fieldElements.push(<DroppableCard key={card.id} cardID={card.id} />)
        if (showTutorial || showPostshadow) {
            fieldElements.push(<ShadowCard key={"post-shadow"} intent={showPostshadow} message={showTutorial ? "After?" : ""} />)
        }
    }

    return (<div className='h-screen bg-red-600'>
        <LayoutGroup>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragMove={handleDragMove}
            >
                <div className="w-full h-fit flex items-center justify-evenly py-16 gap-10 overflow-auto">
                    {...fieldElements}
                </div>
                <div className="w-full min-h-1 flex items-center justify-evenly gap-10 bg-blue-500">
                    {/* Don't render while dragging, since the overlay is taking over */}
                    {!draggingCard && <DraggableCard key={activeCard.id} cardID={activeCard.id}></DraggableCard>}
                </div>
                {/* Can't use snapCenterToCursor since it messes with the reset*/}
                <DragOverlay modifiers={[restrictToWindowEdges]}>
                    {/* This presentational element is what is on the mouse */}
                    {draggingCard ? <Card key={activeCard.id} cardID={draggingCard} /> : null}
                </DragOverlay>
            </DndContext>
        </LayoutGroup>
    </div >
    );

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        setDraggingCard(active.id as string);
    }

    function getInsertionIndex(active: Active, over: Over) {
        // Get the mouse's x position
        const mouseX = (active.rect.current.translated!.left + active.rect.current.translated!.right) / 2;
        // Get the target card's x position
        const targetX = (over.rect.left + over.rect.right) / 2
        console.log(mouseX, targetX)

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

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        // There will always be an over since we are using closestCenter
        if (!over || !inPlayingField(active)) {
            setDraggingCard(null);
            setInsertionIntent(null);
            return
        }

        // Play the card at the insertion index
        playCard(getInsertionIndex(active, over))
        // Stop dragging the card
        setDraggingCard(null);
    }

    function handleDragMove(event: DragMoveEvent) {
        const { active, over } = event;

        // Do not do anything if not dragging upwards from the start
        if (!over || !inPlayingField(active)) {
            setInsertionIntent(null);
            return
        }

        setInsertionIntent(getInsertionIndex(active, over));
    }
}