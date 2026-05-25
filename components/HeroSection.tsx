"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import InputBar from "./InputBar";

interface HeroSectionProps {
    onSubmit: (url: string) => void;
    isLoading: boolean;
}

export default function HeroSection({ onSubmit, isLoading }: HeroSectionProps) {
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
    };

    return (
        <section className="relative flex flex-col justify-center flex-grow w-full px-6 md:px-[80px] min-h-screen">
            <div className="max-w-[800px] w-full z-10">
                {/* Eyebrow Label */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-4"
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
                    className="font-grotesk font-bold text-[40px] md:text-[72px] leading-[1.1] text-text-primary mb-3"
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
                    className="font-inter text-text-secondary text-[16px] max-w-[400px] mb-[32px]"
                >
                    Paste a public GitHub URL. Get a score, a breakdown, and a fix list.
                </motion.p>

                {/* Input Area */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="w-full max-w-[600px]"
                >
                    <InputBar onSubmit={onSubmit} isLoading={isLoading} initialValue={exampleUrl} />

                    {/* Example Links */}
                    <div className="mt-4 flex items-center gap-2 font-inter text-[13px]">
                        <span className="text-text-secondary">Try &rarr;</span>
                        <button
                            onClick={() => handleExampleClick("vercel/next.js")}
                            disabled={isLoading}
                            className="text-accent hover:underline transition-all disabled:opacity-50"
                        >
                            vercel/next.js
                        </button>
                        <span className="text-text-dim px-1">&middot;</span>
                        <button
                            onClick={() => handleExampleClick("facebook/react")}
                            disabled={isLoading}
                            className="text-accent hover:underline transition-all disabled:opacity-50"
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