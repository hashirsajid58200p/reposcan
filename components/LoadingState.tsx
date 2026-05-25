"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LoadingStateProps {
    message: string;
}

export default function LoadingState({ message }: LoadingStateProps) {
    return (
        <div className="w-full max-w-[600px] mt-6 flex flex-col items-center">
            {/* Cycling Text Messages */}
            <div className="h-6 relative w-full mb-3">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={message}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="font-inter text-text-secondary text-[13px] w-full text-center absolute left-0 right-0 top-0 mx-auto"
                    >
                        {message}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Circular Spinner Loader */}
            <div className="mt-2 flex justify-center">
                <svg
                    className="animate-spin h-6 w-6 text-accent"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </div>
        </div>
    );
}