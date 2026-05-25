import { NextRequest, NextResponse } from "next/server";
import { parseGitHubUrl } from "@/lib/parser";
import { fetchAllRepoData } from "@/lib/github";
import { calculateHealthScore } from "@/lib/scorer";
import { ErrorType } from "@/lib/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url || typeof url !== "string") {
            return NextResponse.json(
                { error: "invalid_url" as ErrorType, message: "URL is required." },
                { status: 400 }
            );
        }

        // 1. Parse and validate the URL
        const parsed = parseGitHubUrl(url);
        if (!parsed.isValid || !parsed.owner || !parsed.repo) {
            return NextResponse.json(
                { error: "invalid_url" as ErrorType, message: parsed.error },
                { status: 400 }
            );
        }

        // 2. Fetch all data in parallel from GitHub
        const rawData = await fetchAllRepoData(parsed.owner, parsed.repo);

        // 3. Calculate the score and generate the fix list
        const result = calculateHealthScore(rawData);

        // 4. Return the complete analysis
        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        // Handle specific errors thrown by our GitHub fetching layer
        const status = error.status || 500;
        let errorType: ErrorType = "unknown";
        let message = "An unexpected error occurred while analyzing the repository.";

        if (error.message === "not_found") {
            errorType = "not_found";
            message = "Repository not found or is private.";
        } else if (error.message === "rate_limited") {
            errorType = "rate_limited";
            message = "GitHub API rate limit hit. Wait 60 seconds and retry.";
        } else if (error.status === 408) {
            errorType = "unknown";
            message = error.message; // "GitHub API is taking too long..."
        }

        return NextResponse.json(
            { error: errorType, message },
            { status: status === 404 || status === 403 || status === 429 ? status : 500 }
        );
    }
}