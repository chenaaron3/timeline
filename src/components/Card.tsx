import React from 'react'
import { type Event } from '~/utils/types'
import { IMAGE_MAP } from "~/generated/WorldHistoryImages";
import Image from 'next/image';

interface CardProps {
    event: Event
}

export const Card: React.FC<CardProps> = ({ event }) => {
    return (<div className='w-[270px] h-[360px] relative rounded-3xl overflow-hidden bg-white'>
        <Image src={IMAGE_MAP[event.id]!} alt={event.title} className='py-5 px-5 rounded-3xl' />
        <div className='relative bottom-24 text-center text-wrap w-full flex items-center flex-col '>
            <div className='relative translate-y-3 h-[36px] m-auto w-1/3 bg-red-800 rounded-3xl flex justify-center items-center'>
                <p className='w-full'>{event.year}</p>
            </div>
            <div className='h-[48px] m-auto w-2/3 bg-red-800 rounded-3xl flex justify-center items-center'>
                <h2 className='max-w-full max-h-full text-xs'>{event.title}</h2>
            </div>
        </div>
    </div>)
}