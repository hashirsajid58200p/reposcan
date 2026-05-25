"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InputBar from "./InputBar";
import LoadingState from "./LoadingState";
import ErrorBanner from "./ErrorBanner";
import { ErrorType } from "@/lib/types";

interface HeroSectionProps {
    onSubmit: (url: string) => void;
    isLoading: boolean;
    status: "idle" | "loading" | "success" | "error";
    loadingMessage?: string;
    errorType?: ErrorType | null;
    errorMessage?: string;
    onDismissError?: () => void;
}

export default function HeroSection({
    onSubmit,
    isLoading,
    status,
    loadingMessage,
    errorType,
    errorMessage,
    onDismissError,
}: HeroSectionProps) {
    const [exampleUrl, setExampleUrl] = useState("");

    const handleExampleClick = (url: string) => {
        setExampleUrl(url);
    };

    // Framer Motion variants for the staggered text animation
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    } as const;

    return (
        <section className="relative flex flex-col justify-center flex-grow w-full px-6 md:px-[80px] min-h-screen">
            <div className="max-w-[800px] w-full z-10 mx-auto flex flex-col items-center text-center">
                {/* Eyebrow Label */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-4 text-center"
                >
                    <span className="text-accent text-[11px] font-bold tracking-[0.15em] uppercase border-b-[2px] border-accent pb-[2px]">
                        Health Checker
                    </span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="font-grotesk font-bold text-[40px] md:text-[72px] leading-[1.1] text-text-primary mb-3 text-center"
                >
                    <motion.span variants={itemVariants} className="block">
                        How healthy is
                    </motion.span>
                    <motion.span variants={itemVariants} className="block text-text-primary">
                        your repository?
                    </motion.span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="font-inter text-text-secondary text-[16px] max-w-[400px] mb-8 mx-auto text-center"
                >
                    Paste a public GitHub URL. Get a score, a breakdown, and a fix list.
                </motion.p>

                {/* Inline Loading / Error State between Subtitle and Input Bar */}
                <div className="w-full max-w-[600px] mx-auto flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        {status === "loading" && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-full flex justify-center mb-6"
                            >
                                <LoadingState message={loadingMessage || ""} />
                            </motion.div>
                        )}
                        {status === "error" && errorType && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-full flex justify-center mb-6"
                            >
                                <ErrorBanner
                                    type={errorType}
                                    message={errorMessage || ""}
                                    onDismiss={onDismissError || (() => {})}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Input Area */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="w-full max-w-[600px] mx-auto flex flex-col items-center"
                >
                    <InputBar onSubmit={onSubmit} isLoading={isLoading} initialValue={exampleUrl} />

                    {/* Example Links */}
                    <div className="mt-4 flex items-center justify-center gap-2 font-inter text-[13px] w-full">
                        <span className="text-text-secondary">Try &rarr;</span>
                        <button
                            onClick={() => handleExampleClick("vercel/next.js")}
                            disabled={isLoading}
                            className="text-accent hover:underline transition-all disabled:opacity-50 cursor-pointer"
                        >
                            vercel/next.js
                        </button>
                        <span className="text-text-dim px-1">&middot;</span>
                        <button
                            onClick={() => handleExampleClick("facebook/react")}
                            disabled={isLoading}
                            className="text-accent hover:underline transition-all disabled:opacity-50 cursor-pointer"
                        >
                            facebook/react
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Atmospheric Details */}
            <div className="absolute bottom-6 left-6 md:left-[80px] origin-bottom-left -rotate-90 text-[11px] font-mono text-[#333333] whitespace-nowrap pointer-events-none select-none">
                REPO HEALTH ANALYZER v1.0
            </div>

            <div className="absolute bottom-6 right-6 md:right-[80px] text-[11px] font-mono text-[#333333] uppercase pointer-events-none select-none tracking-widest hidden md:block">
                README &middot; CI/CD &middot; COMMITS &middot; ISSUES &middot; LICENSE &middot; CONTRIBUTING
            </div>
        </section>
    );
}