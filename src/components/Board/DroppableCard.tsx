import React from 'react';
import { useGameStore } from '~/state';

import { useDroppable } from '@dnd-kit/core';

import { Card, CardProps } from './Card';

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