export interface ParsedUrlResult {
    isValid: boolean;
    owner?: string;
    repo?: string;
    error?: string;
}

/**
 * Parses and validates a GitHub repository URL or string.
 * Acceptable formats:
 * - github.com/owner/repo
 * - https://github.com/owner/repo
 * - http://github.com/owner/repo
 */
export function parseGitHubUrl(input: string): ParsedUrlResult {
    const trimmed = input.trim();
    const defaultError = "Invalid URL format. Expected: github.com/owner/repo";

    if (!trimmed) {
        return { isValid: false, error: defaultError };
    }

    // Prepend https:// if no protocol is provided to allow the URL constructor to work
    let urlString = trimmed;
    if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
        urlString = "https://" + urlString;
    }

    try {
        const url = new URL(urlString);

        // Must be a github.com domain
        if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
            return { isValid: false, error: defaultError };
        }

        // Extract path segments, ignoring empty strings (e.g., from trailing slashes)
        const pathSegments = url.pathname.split("/").filter(Boolean);

        // Reject if missing owner or repo
        if (pathSegments.length < 2) {
            return { isValid: false, error: defaultError };
        }

        // Reject if there are extra segments (e.g., /tree/main, /issues)
        if (pathSegments.length > 2) {
            return { isValid: false, error: defaultError };
        }

        const owner = pathSegments[0];
        // Strip trailing .git if the user copied a clone URL
        const repo = pathSegments[1].replace(/\.git$/, "");

        return {
            isValid: true,
            owner,
            repo,
        };
    } catch {
        // Catches completely malformed strings that the URL constructor rejects
        return { isValid: false, error: defaultError };
    }
}