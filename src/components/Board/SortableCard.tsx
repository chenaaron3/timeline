import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Card, type CardProps } from './Card';

export const SortableCard: React.FC<CardProps> = (props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.cardID });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Card ref={setNodeRef} style={style} {...attributes} {...listeners} {...props} />
    );
}