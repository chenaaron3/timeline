import React, { forwardRef } from 'react'
import Image from 'next/image';
import { useGameStore } from '~/state';
import { motion } from "motion/react"

export interface CardProps {
    cardID: string
    style?: React.CSSProperties;
    showDate?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ cardID, showDate, ...props }, ref) => {
        const card = useGameStore.use.cardMap()[cardID];

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
                    className='relative min-w-[21vh] w-[21vh] h-[28vh] rounded-3xl overflow-hidden bg-white'
                    animate={showDate ? { scale: 1 } : undefined}
                    initial={showDate ? { scale: 0 } : undefined}
                    layoutId={cardID}
                >
                    {/* eslint-disable-next-line */}
                    <Image src={card.image} alt={card.title} className='py-4 px-3 rounded-3xl' />
                    <div className='absolute bottom-5 text-center text-wrap w-full flex items-center flex-col '>
                        {showDate && <div className='absolute bottom-9 h-[36px] m-auto w-1/3 bg-red-800 rounded-3xl flex justify-center items-center'>
                            <p className='w-full'>{card.year}</p>
                        </div>
                        }
                        <div className='absolute bottom-0 h-[48px] m-auto w-2/3 bg-red-800 rounded-3xl flex justify-center items-center'>
                            <h2 className='max-w-full max-h-full text-xs'>{card.title}</h2>
                        </div>
                    </div>
                </motion.div>
            </div>)
    }
)