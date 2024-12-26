import { motion } from "motion/react"

interface ShadowCardProps {
    message?: string;
    intent?: boolean;
}

export const ShadowCard: React.FC<ShadowCardProps> = ({ message, intent }) => {
    const backgroundColor = intent ? "rgb(22 163 74 / var(--tw-bg-opacity, 1))" : "rgb(75 85 99 / var(--tw-bg-opacity, 1))"
    const outlineColor = intent ? "#86efac" : "#d1d5db"
    return <motion.div
        className={`relative min-w-[21vh] w-[21vh] h-[28vh] rounded-3xl overflow-hidden bg-opacity-70 outline-dashed`}
        initial={{ scale: .5 }}
        animate={{ scale: 1 }}
        layoutId="shadow"
        style={{
            backgroundColor: backgroundColor,
            outlineColor: outlineColor,
        }}
    >
        <div className="flex h-full justify-center items-center">
            <span style={{ color: outlineColor }}>{message ? message : "Place"}</span>
        </div>
    </motion.div>
}