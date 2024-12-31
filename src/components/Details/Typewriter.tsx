import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';

interface TypewriterProps {
    shortText: string;
    longText: string;
    speed?: number;
}

export const Typewriter: React.FC<TypewriterProps> = ({ shortText, longText, speed = 10 }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [learnMore, setLearnMore] = useState(true);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        setIsComplete(displayedText === shortText);
    }, [displayedText, shortText]);

    useEffect(() => {
        let index = 0;
        const typingInterval = setInterval(() => {
            const text = learnMore ? longText : shortText;
            if (index < text.length) {
                const step = 2;
                setDisplayedText(text.slice(0, index + step));
                index += step;
            }
            if (index >= text.length) {
                clearInterval(typingInterval);
            }
        }, speed);

        return () => clearInterval(typingInterval); // Cleanup the interval on unmount
    }, [learnMore, shortText, longText, speed]);

    return <div className="flex flex-col items-start justify-start w-full h-full">
        <div className="h-full overflow-auto">
            {displayedText.split("").map(
                (char, i) => <motion.span
                    key={"typewriter" + char + i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {char}
                </motion.span>)
            }
        </div>
        {isComplete &&
            <>
                <Separator />
                <Button variant="link" onClick={() => setLearnMore(!learnMore)}>
                    Learn More
                </Button>
            </>}
    </div>;
};