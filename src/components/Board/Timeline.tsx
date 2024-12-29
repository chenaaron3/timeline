import { useGameStore } from '~/state';

import { DroppableCard } from './DroppableCard';
import { ShadowCard } from './ShadowCard';

interface TimelineProps {
    draggingCard: string | null;
    insertionIntent: number | null;
}

export const Timeline: React.FC<TimelineProps> = ({
    draggingCard,
    insertionIntent
}) => {
    const playedCards = useGameStore.use.playedCards();

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

        // Intent card should be identicle so they could intepolate smoothly
        // Tutorial cards need to be differentiated
        if (showTutorial || showPreshadow) {
            fieldElements.push(<ShadowCard key={(showTutorial ? "pre" : "") + "shadow"} intent={showPreshadow} message={showTutorial ? "Before?" : ""} />)
        }
        fieldElements.push(<DroppableCard key={card.id} cardID={card.id} />)
        if (showTutorial || showPostshadow) {
            fieldElements.push(<ShadowCard key={(showTutorial ? "post" : "") + "shadow"} intent={showPostshadow} message={showTutorial ? "After?" : ""} />)
        }
    }

    fieldElements.push()

    return <div className="relative flex items-center w-full gap-10 p-2 overflow-auto h-fit justify-evenly">
        <div className='fixed w-full h-1 border-t-4 border-[--text-color] border-dashed' ></div>
        {...fieldElements}
    </div>
}