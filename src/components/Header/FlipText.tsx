import { AnimatePresence, motion } from 'motion/react';

interface FlipTextProps {
    id: string;
    text: string;
}

// Uses framer motion AnimatePresence to animate the text flipping.
// Should imitate an old school flip clock.

export const FlipText: React.FC<FlipTextProps> = ({ id, text }) => {
    const textArray = text.split('');
    return (
        <span className="flex items-center justify-center overflow-hidden">
            <AnimatePresence mode='popLayout'>
                {textArray.map((char, index) => (
                    <motion.span
                        key={id + index + char}
                        initial={{
                            translateY: "-100%",
                        }}
                        animate={{
                            translateY: "0%",
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        className={!isNaN(Number(char)) ? "w-3" : "w-1"}
                    >
                        {char}
                    </motion.span>
                ))}
            </AnimatePresence>
        </span>
    );
};