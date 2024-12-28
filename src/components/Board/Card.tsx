import { motion } from 'motion/react';
import Image from 'next/image';
import React, { forwardRef, useEffect, useState } from 'react';
import { useGameStore } from '~/state';

export interface CardProps {
    cardID: string
    style?: React.CSSProperties;
    showDate?: boolean;
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
        const card = useGameStore.use.cardMap()[cardID];

        const [textSize, setTextSize] = useState("text-lg");

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
            <div
                ref={ref}
                {...props}
            >
                <motion.div
                    // Disable touch actions for mobile
                    className={`relative min-w-40 w-40 h-56 rounded-3xl bg-white text-white ${!showDate && 'touch-none'} drop-shadow-2xl`}
                    initial={showDate ? { translateY: -100 } : undefined}
                    animate={showDate ? { translateY: 0 } : undefined}
                    layoutId={cardID}
                >
                    {/* eslint-disable-next-line */}
                    <Image src={card.image} alt={card.title} className='px-2 py-3 rounded-3xl' />
                    <div className='absolute bottom-0 flex flex-col items-center w-full text-center text-wrap '>
                        {showDate && <div className='z-10 flex items-center justify-center w-2/5 h-6 m-auto text-xl translate-y-1 bg-[var(--sub-error-color)] rounded-xl outline-[var(--accent-color)] outline-double'>
                            <p className='w-full'>{card.year}</p>
                        </div>
                        }
                        <div className='flex items-center justify-center w-5/6 h-10 p-1 mx-auto mb-1 bg-[var(--sub-error-color)] shadow-sm rounded-3xl outline-[var(--accent-color)] outline-double shadow-black'>
                            <h2 className={`max-w-full max-h-full`}
                                style={{
                                    fontSize: textSize,
                                }}>{card.title}</h2>
                        </div>
                    </div>
                </motion.div>
            </div>)
    }
)