import { useEffect, useState } from "react";
import { Button } from './ui/button';
import { Separator } from "~/components/ui/separator"

interface TypewriterProps {
    shortText: string;
    longText: string;
    speed?: number;
}

export const Typewriter: React.FC<TypewriterProps> = ({ shortText, longText, speed = 10 }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [learnMore, setLearnMore] = useState(false);

    const isComplete = displayedText === shortText;

    useEffect(() => {
        let index = 0;
        const typingInterval = setInterval(() => {
            const text = learnMore ? longText : shortText;
            if (index < text.length) {
                console.log(index)
                setDisplayedText(text.slice(0, index + 1));
                index++;
            }
            if (index === text.length) {
                clearInterval(typingInterval);
            }
        }, speed);

        return () => clearInterval(typingInterval); // Cleanup the interval on unmount
    }, [learnMore, shortText, longText, speed]);

    return <div className="flex flex-col items-center justify-center h-full">
        <div className="h-full overflow-auto">{displayedText}</div>
        {isComplete &&
            <>
                <Separator />
                <Button variant="link" onClick={() => setLearnMore(!learnMore)}>
                    Learn More
                </Button>
            </>}
    </div>;
};