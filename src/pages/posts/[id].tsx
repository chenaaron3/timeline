import { motion, useScroll } from 'framer-motion';
import { chunk } from 'lodash';
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { useRef } from 'react';
import { DECK_NAMES, DISPLAY_DECKS, DisplayDecks } from '~/utils/constants';
import { getDeck } from '~/utils/deck';
import { Event } from '~/utils/types';

// Icons are not serializable, so remove it
type SerializableDeck = Omit<DisplayDecks, 'icon'>;

type PageProps = {
    metadata: SerializableDeck,
    content: Event[],
};

export default function Page({ metadata, content }: PageProps) {
    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({
    });

    if (!metadata.blogData) {
        return
    }

    console.log(scrollYProgress)

    return (
        <>
            <motion.div
                className="fixed left-0 top-0 h-2 rounded-full w-full bg-black"
                style={{
                    left: 0,
                    scaleX: scrollYProgress, // Scale the width of the bar dynamically
                }}
            />
            <main className='w-dvw overflow-y-scroll flex flex-col items-center justify-center'>
                {/* Content */}
                <div ref={containerRef} className="my-36 max-w-3xl">
                    {/* Title and Description */}
                    <div className='flex flex-col gap-5'>
                        <h2 className='w-full text-5xl'>
                            {metadata.blogData.title}
                        </h2>
                        <div>
                            {metadata.blogData.description}
                        </div>
                        <div className='italic'>
                            {metadata.blogData.date}
                        </div>
                    </div>
                    {/* Content */}
                    <div className='mt-16'>
                        {
                            content.map(e => {
                                const sentences = e.longDescription.split(".")
                                const sections = chunk(sentences, 10)
                                return <div className='mt-12 flex gap-12 shadow-lg rounded-xl p-12' key={e.id}>
                                    <div className='flex-1 flex justify-center items-center'>
                                        {/* eslint-disable-next-line */}
                                        <Image className='rounded-3xl' alt={e.imagePrompt} src={e.image}></Image>
                                    </div>
                                    <div className='flex-[2] flex flex-col gap-5'>
                                        <h1 className='text-3xl'>{e.title} ({e.year})</h1>
                                        {sections.map((section, sid) => <p key={e.id + sid}>
                                            {section.join(". ")}
                                        </p>)}
                                    </div>
                                </div>
                            })
                        }
                    </div>
                </div>
            </main>
        </>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    // Generate a blog if blog data is defined
    const paths = DISPLAY_DECKS.
        filter(x => x.blogData).
        map((page) => ({
            params: { id: page.id },
        }));

    return {
        paths,
        fallback: false, // Set to 'blocking' or 'true' if you want to allow additional paths
    };
};

export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
    const id = params?.id as DECK_NAMES;
    const metadata = DISPLAY_DECKS.find(x => x.id == id)!;
    const content = getDeck(id)
    content.sort(e => e.year)
    const { icon, ...serializableMetadata } = metadata;
    return {
        props: {
            metadata: serializableMetadata,
            content: content
        },
    };
};
