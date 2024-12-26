import React from 'react';

import { Card, type CardProps } from './Card';
import { useDroppable } from '@dnd-kit/core';

export const DroppableCard: React.FC<CardProps> = (props) => {
    const { setNodeRef } = useDroppable({
        id: props.cardID,
    });

    return (
        <Card showDate ref={setNodeRef} {...props} />
    );
}