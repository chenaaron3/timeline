import { RotateCcw } from 'lucide-react';
import { useGameStore } from '~/state';
import { DISPLAY_DECKS } from '~/utils/constants';
import { HighscoreCategory } from '~/utils/types';
import { formatSeconds } from '~/utils/utils';

import { Button } from '../ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';

export const Results = () => {
    const init = useGameStore.use.init();
    const score = useGameStore.use.score();
    const deckName = useGameStore.use.deckName();
    const deckSize = useGameStore.use.deckSize();
    const longestStreak = useGameStore.use.longestStreak();
    const time = useGameStore.use.time();

    return <div className='flex flex-col items-center justify-center w-1/3 gap-5'>
        <div className='text-3xl'>
            Score for {DISPLAY_DECKS.find((deck) => deck.id == deckName)!.name} Deck
        </div>
        <div className='flex items-center justify-center w-full gap-3'>
            <ResultCategory
                title={'accuracy'}
                titleDisplay='Accuracy'
                value={score.correct / (score.correct + score.incorrect)}
                displayType='percentage'
                description='Accuracy of your answers'
            />
            <ResultCategory
                title={'streak'}
                titleDisplay='Streak'
                value={longestStreak}
                displayType='streak'
                description='Longest streak of correct answers'
            />
            <ResultCategory
                title={'time'}
                titleDisplay='Time'
                value={time}
                displayType='time'
                description='Total duration of the game'
            />
        </div>
        <Button
            variant={'outline'}
            className='bg-[--main-color] text-black'
            onClick={init}>
            <RotateCcw />
            Restart
        </Button>
    </div>
}

interface ResultCategoryProps {
    title: HighscoreCategory
    titleDisplay: string
    description: string
    value: number
    displayType: 'percentage' | 'streak' | 'time'
}

const ResultCategory: React.FC<ResultCategoryProps> = ({ title, titleDisplay, value, displayType, description }) => {
    let displayName = ""

    if (displayType == 'percentage') {
        displayName = `${(value * 100).toFixed(0)}%`
    } else if (displayType == 'streak') {
        displayName = value.toString() + " Row"
    } else if (displayType == 'time') {
        displayName = formatSeconds(value)
    }

    return <Card className="w-1/3">
        <CardHeader>
            <CardTitle>
                <div className='text-3xl font-bold text-center'>
                    {displayName}
                </div>

            </CardTitle>
            <CardDescription>
                <div className='text-xl font-bold text-center'>
                    {titleDisplay}
                </div>
            </CardDescription>
        </CardHeader>
    </Card>
}