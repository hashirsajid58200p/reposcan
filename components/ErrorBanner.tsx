"use client";

import { motion } from "framer-motion";
import { ErrorType } from "@/lib/types";

interface ErrorBannerProps {
    type: ErrorType;
    message: string;
    onDismiss: () => void;
}

export default function ErrorBanner({ type, message, onDismiss }: ErrorBannerProps) {
    // Map error types to strong, bold titles
    const getErrorTitle = (type: ErrorType) => {
        switch (type) {
            case "invalid_url":
                return "INVALID URL";
            case "not_found":
                return "NOT FOUND";
            case "rate_limited":
                return "RATE LIMITED";
            default:
                return "SYSTEM ERROR";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-[600px] mt-6 flex items-start justify-between bg-bg-secondary border border-border-default p-4"
        >
            <div className="flex items-start gap-4">
                {/* Brutalist Warning Square */}
                <div className="w-[20px] h-[20px] shrink-0 bg-accent text-accent-text font-bold font-mono text-[14px] flex items-center justify-center leading-none">
                    !
                </div>

                <div className="flex flex-col pt-[1px]">
                    <h3 className="font-grotesk font-bold text-text-primary uppercase text-[15px] leading-none mb-1">
                        {getErrorTitle(type)}
                    </h3>
                    <p className="font-inter text-text-secondary text-[14px] leading-snug">
                        {message}
                    </p>
                </div>
            </div>

            {/* Dismiss Button */}
            <button
                onClick={onDismiss}
                className="text-text-secondary hover:text-text-primary font-inter text-[14px] transition-colors duration-150 px-2 flex items-center"
                aria-label="Dismiss error"
            >
                ✕
            </button>
        </motion.div>
    );
}