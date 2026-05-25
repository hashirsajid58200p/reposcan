import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query || typeof query !== "string" || query.trim().length <= 2) {
            return NextResponse.json({ items: [] }, { status: 200 });
        }

        const headers: HeadersInit = {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "RepoScan-Health-Checker",
        };

        if (process.env.GITHUB_TOKEN) {
            headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
        }

        const response = await fetch(
            `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`,
            {
                headers,
                // Cache responses for a short duration (e.g. 1 minute) or set no-store
                cache: "no-store",
            }
        );

        if (!response.ok) {
            console.error(`GitHub API returned error: ${response.status}`);
            return NextResponse.json({ items: [] }, { status: 200 });
        }

        const data = await response.json();
        return NextResponse.json({ items: data.items || [] }, { status: 200 });

    } catch (error) {
        console.error("Failed to proxy search request:", error);
        return NextResponse.json({ items: [] }, { status: 200 });
    }
}
