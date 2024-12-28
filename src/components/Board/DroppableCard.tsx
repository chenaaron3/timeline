import React from 'react';

import { Card, type CardProps } from './Card';

import { useDroppable } from '@dnd-kit/core';
import { useGameStore } from '~/state';

export const DroppableCard: React.FC<CardProps> = (props) => {
    const { setNodeRef } = useDroppable({
        id: props.cardID,
    });
    const learnCard = useGameStore.use.learnCard();

    return (
        <div onClick={() => { learnCard(props.cardID) }}>
            <Card showDate ref={setNodeRef} {...props} />
        </div>
    );
}