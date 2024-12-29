import { CircleCheck, CircleX } from 'lucide-react';
import { motion, useAnimation } from 'motion/react';
import { useEffect } from 'react';
import { useGameStore } from '~/state';
import { formatSeconds } from '~/utils/utils';

import { FlipText } from './FlipText';

export function Scoreboard() {
    const score = useGameStore.use.score();
    const time = useGameStore.use.time();
    const setTime = useGameStore.use.setTime();
    // Include the active card as well
    const cardsLeft = useGameStore.use.deck().length + (useGameStore.use.activeCard() ? 1 : 0);

    const correctScoreControls = useAnimation();
    const incorrectScoreControls = useAnimation();


    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (cardsLeft > 0) {
            interval = setInterval(() => {
                setTime(time + 1); // Update time every second
            }, 1000);
        }
        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [time, setTime, cardsLeft]);

    // Bulge animations based on score
    useEffect(() => {
        if (score.correct > 0) {
            void correctScoreControls.start({
                scale: [1, 1.35, 1],
                transition: {
                    duration: 0.35,
                },
            });
        }
    }, [score.correct])

    useEffect(() => {
        if (score.incorrect > 0) {
            void incorrectScoreControls.start({
                scale: [1, 1.35, 1],
                transition: {
                    duration: 0.35,
                },
            });
        }
    }, [score.incorrect])

    return (
        <div className='absolute inset-0 top-0 flex items-center justify-center w-full pt-5 m-auto text-white sm:w-1/3'>
            <motion.div animate={correctScoreControls} className='z-20'>
                <div
                    className='flex items-center justify-center translate-x-3 bg-[--main-color] rounded-full size-14 outline-[--accent-color] outline-solid outline-2 outline'>
                    <CircleCheck size={35} />
                </div>
            </motion.div>
            <div className="z-10 flex items-center justify-center w-full xl:w-1/3 text-2xl outline-[--accent-color] outline-solid outline-2 outline"
                style={{
                    background: 'linear-gradient(60deg, var(--sub-main-color), var(--main-color) 49.9%, var(--accent-color) 50%, var(--error-color) 50.1%, var(--sub-error-color))',
                }}>
                <span className="flex-1 w-full h-full overflow-hidden text-center">
                    <FlipText id='score-correct' text={score.correct.toString()} />
                </span>
                <span className="flex-1 w-full h-full overflow-hidden text-center">
                    <FlipText id='score-incorrect' text={score.incorrect.toString()} />
                </span>
            </div>
            <motion.div animate={incorrectScoreControls} className='z-20'>
                <div
                    className='flex items-center justify-center -translate-x-3 bg-[--error-color] rounded-full size-14 outline-[--accent-color] outline-solid outline-2 outline'>
                    <CircleX size={35} />
                </div>
            </motion.div>
            {/* Trapezoidal shape to indicate cards left in deck */}
            <div className="absolute w-24 h-11 translate-y-1/2 transform -translate-x-1/2 left-1/2 bg-[--accent-color]"
                style={{
                    clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)',
                }}>
                {/* Create an inner trapezoid that is a fraction of the scale */}
                <div className='absolute flex items-end justify-center text-center gap-1 z-10 w-[93%] h-[93%] transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-[--bg-color]'
                    style={{
                        clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)',
                    }}>
                    <FlipText id='cards-left' text={cardsLeft.toString()} />
                    <span>left</span>
                </div>
            </div>
            {/* Game Timer */}
            <div className="absolute w-24 h-11 transform -translate-y-1/2 -translate-x-1/2 left-1/2 bg-[--accent-color]"
                style={{
                    clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
                }}>
                {/* Create an inner trapezoid that is a fraction of the scale */}
                <div className='absolute flex items-start justify-center text-center z-10 w-[93%] h-[93%] transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-[--bg-color]'
                    style={{
                        clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
                    }}>
                    <FlipText id='cards-left' text={formatSeconds(time)} />
                </div>
            </div>
        </div >
    );
}