import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export const DroppableArea: React.FC<{ id: string, children: React.ReactNode }> = (props) => {
    const { setNodeRef } = useDroppable({
        id: props.id,
    });

    return (<div ref={setNodeRef} className="w-full flex items-center justify-evenly py-16 gap-10">
        {props.children}
    </div>
    );
}