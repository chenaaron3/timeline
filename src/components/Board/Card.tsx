import { motion } from 'motion/react';
import Image from 'next/image';
import React, { forwardRef, useEffect, useState } from 'react';
import { useGameStore } from '~/state';

import { TooltipProvider } from '@radix-ui/react-tooltip';

import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export interface CardProps {
    cardID: string
    style?: React.CSSProperties;
    showDate?: boolean;
    children?: React.ReactNode;
}

function mapRange(
    value: number,
    inMin = 5,
    inMax = 40,
    outMin = 1,
    outMax = 0.5
): number {
    // Clamp the value within the input range
    if (value < inMin) {
        value = inMin;
    } else if (value > inMax) {
        value = inMax;
    }

    // Perform linear interpolation
    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ cardID, showDate, ...props }, ref) => {
        const card = useGameStore.use.cardMap()[cardID]!;
        const [textSize, setTextSize] = useState(`${mapRange(card.title.length)}rem`);

        useEffect(() => {
            if (card) {
                setTextSize(`${mapRange(card.title.length)}rem`)
            }
        }, [card?.title, card])

        if (!card) {
            return <div>
            </div>;
        }

        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            ref={ref}
                            {...props}
                        >
                            <motion.div
                                // Disable touch actions for mobile
                                className={`relative hover:cursor-grab min-w-40 w-40 h-60 rounded-3xl bg-white text-white ${!showDate && 'touch-none'} drop-shadow-2xl`}
                                initial={showDate ? { translateY: -100 } : undefined}
                                animate={showDate ? { translateY: 0 } : undefined}
                                layoutId={cardID}
                            >
                                {props.children}
                                {/* eslint-disable-next-line */}
                                <Image src={card.image} alt={card.title} className='px-2 py-3 rounded-3xl' />
                                <div className='absolute flex flex-col items-center w-full text-center bottom-2 text-wrap '>
                                    {showDate && <div className='z-10 flex items-center justify-center w-2/5 h-6 m-auto text-xl translate-y-1 bg-[var(--sub-error-color)] rounded-xl outline-[var(--accent-color)] outline-double'>
                                        <p className='w-full'>{card.year}</p>
                                    </div>
                                    }
                                    <div className='flex items-center justify-center w-5/6 h-10 p-1 mx-auto mb-1 bg-[var(--sub-error-color)] shadow-sm rounded-3xl outline-[var(--accent-color)] outline-double shadow-black'>
                                        <span className={`max-w-full max-h-full`}
                                            style={{
                                                fontSize: textSize,
                                            }}>{
                                                card.title}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{card.description}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }
)