import React, { forwardRef, useEffect, useState } from 'react'
import Image from 'next/image';
import { useGameStore } from '~/state';
import { motion } from "motion/react"

export interface PlayedCardProps {
    cardID: string
    style?: React.CSSProperties;
}

function mapRange(
    value: number,
    inMin: number = 5,
    inMax: number = 40,
    outMin: number = 1,
    outMax: number = 0.5
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

export const PlayedCard = forwardRef<HTMLDivElement, PlayedCardProps>(
    ({ cardID, ...props }, ref) => {
        const card = useGameStore.use.cardMap()[cardID];

        const [textSize, setTextSize] = useState("text-lg");

        useEffect(() => {
            if (card) {
                setTextSize(`${mapRange(card.title.length)}rem`)
            }
        }, [card?.title])

        useEffect(() => {
            console.log(card?.title.length, textSize)
        }, [textSize])

        if (!card) {
            return <div>
                Cannot find card {cardID}!
            </div>;
        }

        return (
            <div
                ref={ref}
                {...props}
            >
                <motion.div
                    // Disable touch actions for mobile
                    className={`relative min-w-[20vh] w-[20vh] h-[30vh] rounded-3xl  bg-white drop-shadow-2xl`}
                    initial={{ translateY: -100 }}
                    animate={{ translateY: 0 }}
                    layoutId={cardID}
                >
                    {/* eslint-disable-next-line */}
                    <Image src={card.image} alt={card.title} className='px-2 py-3 rounded-3xl' />
                    <div className='absolute bottom-0 flex flex-col items-center w-full text-center text-wrap '>
                        <div className='translate-y-1 h-[v5vh] text-sm z-10 m-auto w-1/3 bg-red-800 rounded-xl flex justify-center items-center outline-yellow-300 outline-double'>
                            <p className='w-full'>{card.year}</p>
                        </div>
                        <div className='mb-1 h-[6vh] p-1 mx-auto w-5/6 bg-red-800 rounded-3xl flex justify-center items-center outline-yellow-300 outline-double shadow-sm shadow-black'>
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