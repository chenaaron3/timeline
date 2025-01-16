import { RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useGameStore } from '~/state';
import { HighscoreCategory, Highscores } from '~/utils/types';
import { formatSeconds, getUserData, saveHighScore } from '~/utils/utils';

import { Button } from '../ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';

export const Results = () => {
    const init = useGameStore.use.init();
    const score = useGameStore.use.score();
    const deckName = useGameStore.use.deckName();
    const deckSize = useGameStore.use.deckSize();
    const longestStreak = useGameStore.use.longestStreak();
    const time = useGameStore.use.time();
    const [currentHighScore, setHighScores] = useState<Highscores | undefined>({
        accuracy: 0,
        streak: 0,
        time: 100000000,
    });

    useEffect(() => {
        const highScores = getUserData().highScores;
        const highScoreKey = `${deckName}-${deckSize}`;
        const currentHighScore = highScores[highScoreKey];
        setHighScores(currentHighScore);
    }, [deckName, deckSize])

    const mySaveHighScore = useCallback(() => {
        return (category: HighscoreCategory, value: number) => {
            setHighScores(saveHighScore(deckName, deckSize, category, value))
        }
    }, [deckName, deckSize])

    return <div className='pointer-events-auto max-h-[50%] sm:max-w-[50%] flex flex-col items-center justify-center w-full gap-5'>
        <div className='flex items-center justify-center w-full gap-3 p-3'>
            <ResultCategory
                category={'streak'}
                titleDisplay='Streak'
                value={longestStreak}
                displayType='streak'
                currentHighScore={currentHighScore?.streak}
                saveHighScore={mySaveHighScore}
            />
            <ResultCategory
                category={'accuracy'}
                titleDisplay='Accuracy'
                value={score.correct / (score.correct + score.incorrect)}
                displayType='percentage'
                currentHighScore={currentHighScore?.accuracy}
                saveHighScore={mySaveHighScore}
            />
            <ResultCategory
                category={'time'}
                titleDisplay='Time'
                value={time}
                displayType='time'
                currentHighScore={currentHighScore?.time}
                saveHighScore={mySaveHighScore}
            />
        </div>
        <Button
            variant={'secondary'}
            // className='bg-[--main-color] text-black'
            onClick={() => init()}>
            <RotateCcw />
            Restart
        </Button>
    </div>
}

function getDisplayValue(displayType: 'percentage' | 'streak' | 'time', value: number) {
    if (displayType == 'percentage') {
        return `${(value * 100).toFixed(0)}%`
    } else if (displayType == 'streak') {
        return value.toString()
    } else if (displayType == 'time') {
        return formatSeconds(value)
    }
}

interface ResultCategoryProps {
    category: HighscoreCategory
    titleDisplay: string
    value: number
    displayType: 'percentage' | 'streak' | 'time'
    currentHighScore?: number
    saveHighScore: (category: HighscoreCategory, value: number) => void
}

const ResultCategory: React.FC<ResultCategoryProps> = ({
    category, titleDisplay, value, displayType, currentHighScore, saveHighScore,
}) => {
    const [highScoreText, setHighScoreText] = useState<string>('')

    useEffect(() => {
        let isNewHighScore = true;
        if (currentHighScore != undefined) {
            //  Check for new best high score
            if (category == 'accuracy' && value <= currentHighScore) {
                isNewHighScore = false;
            } else if (category == 'streak' && value <= currentHighScore) {
                isNewHighScore = false;
            } else if (category == 'time' && value >= currentHighScore) {
                isNewHighScore = false;
            }

            if (isNewHighScore) {
                setHighScoreText('New Best!')
            } else {
                setHighScoreText(`Best: ${getDisplayValue(displayType, currentHighScore)}`)
            }
        }

        if (isNewHighScore) {
            saveHighScore(category, value)
        }
    }, [currentHighScore, value, category])

    return <Card className="flex-1 min-w-0 font-bold text-center sm:w-1/3">
        <CardHeader>
            <CardTitle>
                <div className='text-xl sm:text-3xl'>
                    {getDisplayValue(displayType, value)}
                </div>
            </CardTitle>
            <CardDescription>
                <div className='text-sm sm:text-xl'>
                    {titleDisplay}
                </div>
                <div className='text-xs sm:text-sm'>
                    {highScoreText}
                </div>
            </CardDescription>
        </CardHeader>
    </Card>
}