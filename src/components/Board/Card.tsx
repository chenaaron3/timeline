import { motion } from 'motion/react';
import Image from 'next/image';
import React, { forwardRef, useEffect, useState } from 'react';
import { useGameStore } from '~/state';
import { useMediaQueries } from '~/utils/mediaQueries';
import { prettyPrintNumber } from '~/utils/utils';

import { TooltipProvider } from '@radix-ui/react-tooltip';

import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export interface CardProps {
    cardID: string
    style?: React.CSSProperties;
    showDate?: boolean;
    children?: React.ReactNode;
    previewable?: boolean
    incorrect?: boolean
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
    ({ cardID, showDate, incorrect, previewable = true, ...props }, ref) => {
        const card = useGameStore.use.cardMap()[cardID]!;
        const [textSize, setTextSize] = useState(`${mapRange(card.title.length)}rem`);
        const { isSmallScreen } = useMediaQueries();

        useEffect(() => {
            if (card) {
                let textSize = mapRange(card.title.length)
                if (isSmallScreen) {
                    textSize = textSize * 0.75
                }
                setTextSize(`${textSize}rem`)
            }
        }, [card?.title, card])

        if (!card) {
            return <div>
            </div>;
        }

        const element = <div
            ref={ref}
            {...props}
        >
            <motion.div
                // Disable touch actions for mobile
                className={`relative pointer-events-auto hover:cursor-grabs w-32 min-w-32 h-48 sm:min-w-40 sm:w-40 sm:h-60 rounded-3xl bg-white text-white ${!showDate && 'touch-none'} drop-shadow-2xl`}
                initial={showDate ? {
                    // translateY: -100,
                    backgroundColor: "#FFFFFF"
                } : undefined}
                animate={showDate ? {
                    // translateY: 0,
                    backgroundColor: incorrect ? "var(--error-color)" : "#FFFFFF",
                } : undefined}
                layoutId={cardID}
                layout
            >
                {props.children}

                {/* eslint-disable-next-line */}
                <Image src={card.image}
                    alt={card.title}
                    className='px-2 py-3 rounded-3xl w-full'
                />
                <div className='absolute flex flex-col items-center w-full text-center bottom-2 text-wrap '>
                    {showDate && <div className='z-10 flex items-center justify-center w-2/5 h-4 sm:h-6 m-auto text-sm sm:text-xl translate-y-1 bg-[var(--sub-error-color)] rounded-xl outline-[var(--accent-color)] outline-solid outline-1 outline'>
                        <p className='w-full'>{prettyPrintNumber(card.rank)}</p>
                    </div>
                    }
                    <div className='flex items-center justify-center w-5/6 h-8 sm:h-10 p-1 mx-auto mb-1 bg-[var(--sub-error-color)] shadow-sm rounded-3xl outline-[var(--accent-color)] outline-solid outline-1 outline shadow-black'>
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

        if (!previewable) {
            return element
        } else {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {element}
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{card.description}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        }
    }
)