import React from 'react';
import { CSS } from '@dnd-kit/utilities';

import { Card, type CardProps } from './Card';
import { useDraggable } from '@dnd-kit/core';

export const DraggableCard: React.FC<CardProps> = (props) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: props.cardID,
    });
    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <Card ref={setNodeRef} style={style} {...attributes} {...listeners} {...props} />
    );
}