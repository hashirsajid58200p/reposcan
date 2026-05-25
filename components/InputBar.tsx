"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

interface InputBarProps {
    onSubmit: (url: string) => void;
    isLoading?: boolean;
    initialValue?: string;
}

export default function InputBar({ onSubmit, isLoading = false, initialValue = "" }: InputBarProps) {
    const [input, setInput] = useState(initialValue);

    // Sync state if a user clicks one of the "Try ->" example links in the parent
    useEffect(() => {
        if (initialValue) {
            setInput(initialValue);
        }
    }, [initialValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSubmit(input.trim());
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            // Dims to 40% opacity during the loading state as requested in the design spec
            className={`flex w-full h-[52px] transition-opacity duration-300 ${isLoading ? "opacity-40 pointer-events-none" : "opacity-100"
                }`}
        >
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="github.com/owner/repository"
                className="flex-grow bg-bg-secondary border border-border-default focus:border-border-active text-text-primary text-[15px] font-inter px-[16px] outline-none rounded-none transition-colors duration-150 placeholder:text-text-dim"
                autoComplete="off"
                spellCheck="false"
            />
            <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-[52px] w-[140px] bg-accent text-accent-text font-bold font-inter text-[14px] uppercase flex items-center justify-center rounded-none hover:bg-white transition-colors duration-150 flex-shrink-0 disabled:opacity-50 disabled:hover:bg-accent cursor-pointer"
            >
                Analyze
                <ArrowRight className="ml-1.5 w-[16px] h-[16px] stroke-[2.5]" />
            </button>
        </form>
    );
}