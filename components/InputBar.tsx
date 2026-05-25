"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

interface InputBarProps {
    onSubmit: (url: string) => void;
    isLoading?: boolean;
    initialValue?: string;
}

interface GitHubSuggestion {
    id: number;
    full_name: string;
    description: string | null;
    stargazers_count: number;
    language?: string;
}

export default function InputBar({ onSubmit, isLoading = false, initialValue = "" }: InputBarProps) {
    const [input, setInput] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<GitHubSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const preventSearchRef = useRef(false);

    // Sync state if a user clicks one of the "Try ->" example links in the parent
    useEffect(() => {
        if (initialValue) {
            preventSearchRef.current = true;
            setInput(initialValue);
            setSuggestions([]);
            setShowDropdown(false);
        }
    }, [initialValue]);

    // Click outside to dismiss suggestions dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced search logic
    useEffect(() => {
        if (preventSearchRef.current) {
            preventSearchRef.current = false;
            return;
        }

        if (input.trim().length <= 2) {
            setSuggestions([]);
            setIsSearching(false);
            setShowDropdown(false);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(input.trim())}`);
                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data.items || []);
                    setShowDropdown(true);
                    setActiveSuggestionIndex(-1);
                }
            } catch (err) {
                console.error("Error fetching suggestions:", err);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [input]);

    const handleSelectSuggestion = (fullName: string) => {
        preventSearchRef.current = true;
        setInput(fullName);
        setSuggestions([]);
        setShowDropdown(false);
        onSubmit(fullName);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            preventSearchRef.current = true;
            setShowDropdown(false);
            setSuggestions([]);
            onSubmit(input.trim());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown || suggestions.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveSuggestionIndex((prev) =>
                prev < suggestions.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveSuggestionIndex((prev) =>
                prev > 0 ? prev - 1 : suggestions.length - 1
            );
        } else if (e.key === "Enter") {
            if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
                e.preventDefault();
                handleSelectSuggestion(suggestions[activeSuggestionIndex].full_name);
            }
        } else if (e.key === "Escape") {
            setShowDropdown(false);
        }
    };

    const formatStars = (count: number) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <form
                onSubmit={handleSubmit}
                className={`flex w-full h-[46px] md:h-[52px] ${isLoading ? "pointer-events-none" : ""}`}
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) setShowDropdown(true);
                    }}
                    disabled={isLoading}
                    placeholder="github.com/owner/repository"
                    className="flex-grow bg-bg-secondary border border-border-default focus:border-border-active text-text-primary text-[13px] md:text-[15px] font-inter px-[12px] md:px-[16px] outline-none rounded-none transition-colors duration-150 placeholder:text-text-dim min-w-0"
                    autoComplete="off"
                    spellCheck="false"
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="h-full px-3 md:px-5 bg-accent text-accent-text font-bold font-inter text-[12px] md:text-[14px] uppercase flex items-center justify-center rounded-none hover:bg-white transition-colors duration-150 flex-shrink-0 disabled:bg-bg-tertiary disabled:text-text-secondary disabled:cursor-not-allowed cursor-pointer"
                >
                    Analyze
                    <ArrowRight className="ml-1.5 w-[14px] md:w-[16px] h-[14px] md:h-[16px] stroke-[2.5]" />
                </button>
            </form>

            {/* Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[48px] md:top-[54px] z-50 bg-bg-secondary border border-border-default shadow-2xl flex flex-col max-h-[250px] md:max-h-[300px] overflow-y-auto">
                    {suggestions.map((repo, idx) => (
                        <div
                            key={repo.id}
                            onClick={() => handleSelectSuggestion(repo.full_name)}
                            onMouseEnter={() => setActiveSuggestionIndex(idx)}
                            className={`flex items-center justify-between px-4 py-3 cursor-pointer border-b border-border-default/50 last:border-b-0 transition-colors duration-150 ${
                                idx === activeSuggestionIndex
                                    ? "bg-accent text-accent-text"
                                    : "text-text-primary hover:bg-[#ffd600]/5"
                            }`}
                        >
                            <div className="flex flex-col items-start text-left">
                                <span className="font-mono text-[14px] font-bold">
                                    {repo.full_name}
                                </span>
                                {repo.description && (
                                    <span
                                        className={`font-inter text-[11px] mt-0.5 line-clamp-1 ${
                                            idx === activeSuggestionIndex
                                                ? "text-accent-text/80"
                                                : "text-text-secondary"
                                        }`}
                                    >
                                        {repo.description}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[12px] font-bold ml-4">
                                <span>★ {formatStars(repo.stargazers_count)}</span>
                                {repo.language && (
                                    <>
                                        <span className="opacity-40">&middot;</span>
                                        <span className="opacity-80">{repo.language}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}