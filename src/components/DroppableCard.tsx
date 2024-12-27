import React from 'react';

import { PlayedCard, type PlayedCardProps } from './PlayedCard';

import { useDroppable } from '@dnd-kit/core';

export const DroppableCard: React.FC<PlayedCardProps> = (props) => {
    const { setNodeRef } = useDroppable({
        id: props.cardID,
    });

    return (
        <PlayedCard ref={setNodeRef} {...props} />
    );
}