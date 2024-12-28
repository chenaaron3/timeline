import { CircleCheck, CircleX } from 'lucide-react';
import { useGameStore } from '~/state';

export function Scoreboard() {
    const score = useGameStore.use.score();

    return (
        < div className='absolute inset-0 top-0 flex items-center justify-center w-1/3 pt-5 m-auto text-white'>
            <div className='flex items-center justify-center translate-x-3 bg-[--main-color] rounded-full size-14 outline-[--accent-color] outline-solid outline-2 outline'>
                <CircleCheck size={35} />
            </div>
            <div className="flex items-center justify-center w-1/3 text-2xl outline-[--accent-color] outline-solid outline-2 outline"
                style={{
                    background: 'linear-gradient(60deg, var(--sub-main-color), var(--main-color) 49.9%, var(--accent-color) 50%, var(--error-color) 50.1%, var(--sub-error-color))',
                }}>
                <span className="flex-1 w-full text-center">
                    {score.correct}
                </span>
                <span className="flex-1 w-full text-center">
                    {score.incorrect}
                </span>
            </div>
            <div className='flex items-center justify-center -translate-x-3 bg-[--error-color] rounded-full size-14  outline-[--accent-color] outline-solid outline-2 outline'>
                <CircleX size={35} />
            </div>
        </div >
    );
}