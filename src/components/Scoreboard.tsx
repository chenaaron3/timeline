import { useGameStore } from '~/state';

export function Scoreboard() {
    const score = useGameStore.use.score();

    return (
        < div className='flex justify-center gap-10'>
            <div>Correct: {score.correct}</div>
            <div>Incorrect: {score.incorrect}</div>
        </div >
    );
}