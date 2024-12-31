import { isGameComplete, useGameStore } from '~/state';

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
    const gameComplete = useGameStore(isGameComplete);
    const discardedCards = useGameStore.use.discardedCards();

    const fieldElements = [];
    if (!gameComplete) {
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
    } else {
        // Show discarded as well as played cards, sort them
        const allCards = [...playedCards, ...discardedCards];
        const incorrectCards = new Set(discardedCards.map((c) => c.id));
        allCards.sort((a, b) => a.year - b.year);
        for (const card of allCards) {
            fieldElements.push(<DroppableCard key={card.id} cardID={card.id} incorrect={incorrectCards.has(card.id)} />)
        }
    }

    return <div className="relative flex items-center w-full gap-3 p-2 overflow-auto justify-evenly sm:gap-10 h-fit">
        <div className='fixed w-full h-1 border-t-4 border-[--text-color] border-dashed' ></div>
        {...fieldElements}
    </div>
}
