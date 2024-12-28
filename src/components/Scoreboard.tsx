import { CircleCheck, CircleX } from 'lucide-react';
import { useGameStore } from '~/state';

export function Scoreboard() {
    const score = useGameStore.use.score();

    return (
        < div className='absolute inset-0 flex items-center justify-center w-1/3 pt-12 m-auto'>
            <div className='flex items-center justify-center translate-x-3 bg-[--main-color] rounded-full size-14 outline-[--accent-color] outline-double'>
                <CircleCheck size={35} />
            </div>
            <div className="flex items-center justify-center w-1/3 text-3xl outline-[--accent-color] outline-double"
                style={{
                    background: 'linear-gradient(60deg, var(--sub-main-color), var(--main-color) 49%, var(--accent-color) 50%, var(--error-color) 51%, var(--sub-error-color))',
                }}>
                <span className="flex-1 w-full text-center text-white">
                    {score.correct}
                </span>
                <span className="flex-1 w-full text-center text-white">
                    {score.incorrect}
                </span>
            </div>
            <div className='flex items-center justify-center -translate-x-3 bg-[--error-color] rounded-full size-14 outline-yellow-500 outline-double'>
                <CircleX size={35} />
            </div>
        </div >
    );
}