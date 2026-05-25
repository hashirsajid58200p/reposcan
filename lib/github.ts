import { GitHubRepoData } from "./types";

const GITHUB_API_BASE = "https://api.github.com";

// The aggregate structure that our scorer will consume
export interface RawGitHubData {
    repo: GitHubRepoData;
    readme: string | null;
    workflows: any[];
    commits: any[];
    closedIssues: any[];
    openIssues: any[];
    hasContributing: boolean;
    hasCodeOfConduct: boolean;
    hasPrTemplateIndicator: boolean;
}

/**
 * Custom fetch wrapper with 10-second timeout and strict error handling
 */
async function fetchWithTimeout(endpoint: string) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const headers: HeadersInit = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "RepoScan-Health-Checker",
    };

    // Inject token server-side if it exists
    if (process.env.GITHUB_TOKEN) {
        headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    try {
        const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
            headers,
            signal: controller.signal,
            // Completely disables Next.js caching to fetch real-time data
            cache: "no-store", 
        });

        clearTimeout(timeoutId);

        if (response.status === 404) {
            const error: any = new Error("not_found");
            error.status = 404;
            throw error;
        }

        if (response.status === 403 || response.status === 429) {
            const error: any = new Error("rate_limited");
            error.status = response.status;
            throw error;
        }

        if (!response.ok) {
            const error: any = new Error("unknown");
            error.status = response.status;
            throw error;
        }

        return await response.json();
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === "AbortError") {
            const timeoutErr: any = new Error("unknown");
            timeoutErr.message = "GitHub API is taking too long. Try again in a moment.";
            timeoutErr.status = 408;
            throw timeoutErr;
        }
        throw error;
    }
}

/**
 * Fires all 9 required GitHub API calls in parallel.
 */
export async function fetchAllRepoData(owner: string, repo: string): Promise<RawGitHubData> {
    const endpoints = [
        `/repos/${owner}/${repo}`,
        `/repos/${owner}/${repo}/readme`,
        `/repos/${owner}/${repo}/contents/.github/workflows`,
        `/repos/${owner}/${repo}/commits?per_page=30`,
        `/repos/${owner}/${repo}/issues?state=closed&per_page=100`,
        `/repos/${owner}/${repo}/issues?state=open&per_page=100`,
        `/repos/${owner}/${repo}/contents/CONTRIBUTING.md`,
        `/repos/${owner}/${repo}/contents/CODE_OF_CONDUCT.md`,
        `/repos/${owner}/${repo}/pulls?state=open&per_page=1`, // PR template proxy as requested
    ];

    // Fire everything concurrently
    const promises = endpoints.map((endpoint) => fetchWithTimeout(endpoint));
    const results = await Promise.allSettled(promises);

    // The first promise is the core repo fetch. If this fails, the repo doesn't exist 
    // or we are rate-limited. We must throw immediately.
    const repoResult = results[0];
    if (repoResult.status === "rejected") {
        throw repoResult.reason;
    }

    // Helper to extract data from fulfilled promises safely
    const extract = (res: PromiseSettledResult<any>, fallback: any = null) =>
        res.status === "fulfilled" ? res.value : fallback;

    // Process Base64 encoded README if it exists
    let decodedReadme = null;
    const readmeData = extract(results[1]);
    if (readmeData?.content) {
        // Safely decode base64 in a Node environment
        decodedReadme = Buffer.from(readmeData.content, "base64").toString("utf-8");
    }

    return {
        repo: repoResult.value as GitHubRepoData,
        readme: decodedReadme,
        // Ensure workflows is an array (GitHub returns an array of files if directory exists)
        workflows: Array.isArray(extract(results[2])) ? extract(results[2]) : [],
        commits: extract(results[3], []),
        closedIssues: extract(results[4], []),
        openIssues: extract(results[5], []),
        hasContributing: results[6].status === "fulfilled",
        hasCodeOfConduct: results[7].status === "fulfilled",
        hasPrTemplateIndicator: results[8].status === "fulfilled",
    };
}