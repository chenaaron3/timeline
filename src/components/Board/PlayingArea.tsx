import { useGameStore } from '~/state';

import { DragOverlay } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { Button } from '../ui/button';
import { Card } from './Card';
import { DraggableCard } from './DraggableCard';

interface PlayingAreaProps {
    draggingCard: string | null;
}

export const PlayingArea: React.FC<PlayingAreaProps> = ({
    draggingCard
}) => {
    const activeCard = useGameStore.use.activeCard();
    const init = useGameStore.use.init();

    if (activeCard) {
        return <div className="flex items-center w-full min-h-1 justify-evenly">
            {/* Don't render while dragging, since the overlay is taking over */}
            {!draggingCard && <DraggableCard key={activeCard.id} cardID={activeCard.id}></DraggableCard>}
            {/* Can't use snapCenterToCursor since it messes with the reset*/}
            <DragOverlay modifiers={[restrictToWindowEdges]}>
                {/* This presentational element is what is on the mouse */}
                {draggingCard ? <Card key={activeCard.id} cardID={draggingCard} /> : null}
            </DragOverlay>
        </div>
    } else {
        return <div className="flex items-center w-full min-h-1 justify-evenly">
            <Button
                variant={'outline'}
                className='bg-[--main-color] text-black'
                onClick={init}>
                Play Again
            </Button>
        </div>
    }

}