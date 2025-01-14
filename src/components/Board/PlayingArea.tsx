import { Grab } from 'lucide-react';
import { motion, useAnimationFrame } from 'motion/react';
import React, { useRef, useState } from 'react';
import { useGameStore } from '~/state';
import { isGameComplete } from '~/state/game';
import { Event } from '~/utils/types';

import { DragOverlay } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { Card } from './Card';
import { DraggableCard } from './DraggableCard';
import { Results } from './Results';

interface PlayingAreaProps {
    activeCard?: Event;
    draggingCard: string | null;
    disabled?: boolean;
}

export const PlayingArea: React.FC<PlayingAreaProps> = ({
    activeCard,
    draggingCard,
    disabled,
}) => {
    const playedCards = useGameStore.use.playedCards();
    const discardedCards = useGameStore.use.discardedCards();
    const gameComplete = useGameStore(isGameComplete)

    return <div id="playing-area" className="absolute pointer-events-none bottom-12 w-full flex justify-center items-center min-h-60">
        {
            disabled && <div className='text-center'>
                Waiting for Lobby Owner to Start the Game...
            </div>
        }
        {/* Don't render while dragging, since the overlay is taking over */}
        {!disabled && activeCard && !draggingCard && <DraggableCard key={activeCard.id} cardID={activeCard.id}>
            {playedCards.length + discardedCards.length == 1 &&
                <div className='absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center text-[--accent-color] h-fit w-fit pointer-events-none'>
                    <DragMe />
                </div>
            }
        </DraggableCard>}
        {(!disabled && activeCard && draggingCard) && <DragOverlay modifiers={[restrictToWindowEdges]}>
            <Card key={activeCard.id} cardID={draggingCard} previewable={false} />
        </DragOverlay>}
        {/* Render result screen if there is no more active card */}
        {gameComplete && <Results />}
    </div>
}

function DragMe() {
    const ref = useRef<HTMLDivElement>(null);
    const radius = 25; // Radius of the circle
    const centerX = 0; // Center X-coordinate
    const centerY = 0; // Center Y-coordinate
    const [angle, setAngle] = useState(0); // Current angle

    useAnimationFrame((time, delta) => {
        if (ref.current) {
            const speed = 0.0025 // Speed of the rotation
            setAngle((prev) => prev + delta * speed); // Increment angle based on time
            if (ref.current) {
                ref.current.style.transform = `translate(
          ${centerX + Math.cos(angle) * radius}px,
          ${centerY + Math.sin(angle) * radius}px
        )`;
            }
        }
    });

    return <motion.div
        className='flex items-center justify-center gap-1 p-2 bg-[--accent-color] text-white rounded-full'
        ref={ref}
    >
        <Grab />
        <span>Drag</span>
    </motion.div>
}