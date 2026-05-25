"use client";

import { useState, useCallback, useRef } from "react";
import { AnalysisState, ErrorType } from "@/lib/types";

const LOADING_MESSAGES = [
    "Fetching repository data...",
    "Reading README...",
    "Scanning workflows...",
    "Checking commit history...",
    "Analyzing issues...",
    "Calculating score...",
];

export function useAnalysis() {
    const [state, setState] = useState<AnalysisState>({ status: "idle" });
    const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const clearLoadingInterval = useCallback(() => {
        if (loadingIntervalRef.current) {
            clearInterval(loadingIntervalRef.current);
            loadingIntervalRef.current = null;
        }
    }, []);

    const analyzeRepo = useCallback(async (url: string) => {
        // 1. Reset state and start loading
        setState({ status: "loading", loadingMessage: LOADING_MESSAGES[0] });

        // 2. Start the cycling loading messages (800ms intervals)
        let messageIndex = 0;
        loadingIntervalRef.current = setInterval(() => {
            messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
            setState((prev) =>
                prev.status === "loading"
                    ? { status: "loading", loadingMessage: LOADING_MESSAGES[messageIndex] }
                    : prev
            );
        }, 800);

        try {
            // 3. Call our Next.js API route
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            clearLoadingInterval();

            if (!response.ok) {
                // Handle explicit errors returned by our API
                setState({
                    status: "error",
                    errorType: (data.error as ErrorType) || "unknown",
                    message: data.message || "An unexpected error occurred.",
                });
                return;
            }

            // 4. Success!
            setState({
                status: "success",
                data,
            });

        } catch (error) {
            clearLoadingInterval();
            // Catch network-level errors (e.g., user is offline)
            setState({
                status: "error",
                errorType: "unknown",
                message: "Network error. Please check your connection and try again.",
            });
        }
    }, [clearLoadingInterval]);

    const resetAnalysis = useCallback(() => {
        clearLoadingInterval();
        setState({ status: "idle" });
    }, [clearLoadingInterval]);

    return {
        state,
        analyzeRepo,
        resetAnalysis,
    };
}