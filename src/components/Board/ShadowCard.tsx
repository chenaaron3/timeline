import { motion } from 'motion/react';

interface ShadowCardProps {
    message?: string;
    intent?: boolean;
}

export const ShadowCard: React.FC<ShadowCardProps> = ({ message, intent }) => {
    const backgroundColor = intent ? "var(--sub-main-color)" : "#4B5563"
    const outlineColor = intent ? "var(--main-color)" : "#d1d5db"
    const opacity = intent ? 1 : .7
    return <motion.div
        className={`relative w-20 min-w-20 h-48 sm:min-w-40 sm:w-40 sm:h-60 rounded-3xl overflow-hidden bg-opacity-90 outline-dashed`}
        initial={{ scale: .85 }}
        animate={{
            scale: 1,
            backgroundColor: backgroundColor,
            outlineColor: outlineColor,
            opacity: opacity,
        }}
        layoutId="shadow"
    >
        <div className="flex items-center justify-center h-full">
            <span className='mb-5' style={{ color: outlineColor }}>{message ? message : "Place"}</span>
        </div>
    </motion.div>
}