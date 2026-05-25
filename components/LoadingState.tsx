"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LoadingStateProps {
    message: string;
}

export default function LoadingState({ message }: LoadingStateProps) {
    return (
        <div className="w-full max-w-[600px] mt-6 flex flex-col">
            {/* Indeterminate Progress Bar */}
            <div className="w-full h-[2px] bg-bg-tertiary overflow-hidden relative mb-3">
                <motion.div
                    className="absolute top-0 left-0 h-full w-1/3 bg-accent"
                    animate={{
                        x: ["-100%", "300%", "-100%"],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 1.8,
                        ease: "easeInOut",
                    }}
                />
            </div>

            {/* Cycling Text Messages */}
            <div className="h-6 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={message}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="font-inter text-text-secondary text-[13px] absolute left-0 top-0"
                    >
                        {message}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}