import { useGameStore } from '~/state';
import { isGameComplete } from '~/state/game';
import { DISPLAY_DECKS } from '~/utils/deckCollection';

import { DroppableCard } from './DroppableCard';
import { ShadowCard } from './ShadowCard';

interface TimelineProps {
    incorrectCard?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
    incorrectCard
}) => {
    const playedCards = useGameStore.use.playedCards();
    const deckName = useGameStore.use.deckName();
    const gameComplete = useGameStore(isGameComplete);
    const discardedCards = useGameStore.use.discardedCards();
    const insertionIntent = useGameStore.use.insertionIntent();

    const fieldElements = [];
    if (!gameComplete) {
        const deckData = DISPLAY_DECKS.find(d => d.id == deckName)
        // loop through player cards and add elements to fieldelements
        for (let i = 0; i < playedCards.length; i++) {
            const card = playedCards[i]!;
            // Show preshadow if the intent is to place the card here
            const showPreshadow = insertionIntent === i;
            // Show postshadow if its the last card
            const showPostshadow = insertionIntent === i + 1 && i == playedCards.length - 1

            // Show shadow text for tutorial
            const showTutorial = playedCards.length == 1

            // Intent card should be identicle so they could intepolate smoothly
            // Tutorial cards need to be differentiated
            if (showTutorial || showPreshadow) {
                let message = ""
                if (showTutorial) {
                    if (deckData?.comparisonType == "count") {
                        message = "Less"
                    } else {
                        message = "Before"
                    }
                }
                fieldElements.push(<ShadowCard key={(showTutorial ? "pre" : "") + "shadow"} intent={showPreshadow} message={message} />)
            }
            fieldElements.push(<DroppableCard incorrect={card.id == incorrectCard} key={card.id} cardID={card.id} />)
            if (showTutorial || showPostshadow) {
                let message = ""
                if (showTutorial) {
                    if (deckData?.comparisonType == "count") {
                        message = "More"
                    } else {
                        message = "After"
                    }
                }
                fieldElements.push(<ShadowCard key={(showTutorial ? "post" : "") + "shadow"} intent={showPostshadow} message={message} />)
            }
        }
    } else {
        // Show discarded as well as played cards, sort them
        const allCards = [...playedCards, ...discardedCards];
        const incorrectCards = new Set(discardedCards.map((c) => c.id));
        allCards.sort((a, b) => a.rank - b.rank);
        for (const card of allCards) {
            fieldElements.push(<DroppableCard key={card.id} cardID={card.id} incorrect={incorrectCards.has(card.id)} />)
        }
    }
    // Addding from left and right
    fieldElements.splice(0, 0, <div className='w-16 h-1 min-w-16 sm:min-w-32'></div>)
    fieldElements.push(<div className='w-16 h-1 min-w-16 sm:min-w-32'></div>)

    return <div id="timeline" className='flex items-start overflow-x-auto gap-3 py-12 min-h-60 justify-evenly sm:gap-10 h-full'
        style={{
            scrollbarWidth: 'none',
        }}
    >
        <div className='absolute mt-24 sm:mt-32 w-full h-1 border-t-4 border-[--accent-color] border-dashed' ></div>
        {...fieldElements}
    </div>
}
