import { motion } from 'motion/react';

interface ShadowCardProps {
    message?: string;
    intent?: boolean;
}

export const ShadowCard: React.FC<ShadowCardProps> = ({ message, intent }) => {
    const backgroundColor = intent ? "var(--sub-main-color)" : "rgb(75 85 99 / var(--tw-bg-opacity, 1))"
    const outlineColor = intent ? "var(--main-color)" : "#d1d5db"
    return <motion.div
        className={`relative w-24 min-w-24 h-36 sm:min-w-40 sm:w-40 sm:h-60 rounded-3xl overflow-hidden bg-opacity-90 outline-dashed`}
        initial={{ scale: .75 }}
        animate={{ scale: 1 }}
        layoutId="shadow"
        style={{
            backgroundColor: backgroundColor,
            outlineColor: outlineColor,
        }}
    >
        <div className="flex items-center justify-center h-full">
            <span style={{ color: outlineColor }}>{message ? message : "Place"}</span>
        </div>
    </motion.div>
}