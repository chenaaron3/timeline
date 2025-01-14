import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface TypewriterProps {
    shortText: string;
    longText: string;
    speed?: number;
}

export const Typewriter: React.FC<TypewriterProps> = ({ shortText, longText, speed = 10 }) => {
    const [displayIndex, setDisplayIndex] = useState(0);

    useEffect(() => {
        let index = 0;
        const typingInterval = setInterval(() => {
            const text = longText;
            if (index < text.length) {
                const step = 2;
                setDisplayIndex(index + step);
                index += step;
            }
            if (index >= text.length) {
                clearInterval(typingInterval);
            }
        }, speed);

        return () => clearInterval(typingInterval); // Cleanup the interval on unmount
    }, [shortText, longText, speed]);

    return <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="h-fit">
            {longText.split("").map(
                (char, i) => {
                    return <motion.span
                        key={"typewriter" + char + i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: i < displayIndex ? 1 : 0 }}
                    >
                        {char}
                    </motion.span>
                })
            }
        </div>
    </div>;
};