export interface ParsedUrlResult {
  isValid: boolean;
  owner?: string;
  repo?: string;
  error?: string;
}

export function parseGitHubUrl(input: string): ParsedUrlResult {
  const trimmed = input.trim();
  const defaultError = "Invalid URL format. Expected: github.com/owner/repo";

  if (!trimmed) {
    return { isValid: false, error: defaultError };
  }

  let urlString = trimmed;

  // FIX: If the user just typed "owner/repo" without "github.com", add it for them automatically
  if (!urlString.includes("github.com") && !urlString.startsWith("http")) {
    urlString = "https://github.com/" + urlString;
  } 
  // If they typed "github.com/..." but forgot the "https://", add that
  else if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
    urlString = "https://" + urlString;
  }

  try {
    const url = new URL(urlString);

    if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
      return { isValid: false, error: defaultError };
    }

    const pathSegments = url.pathname.split("/").filter(Boolean);

    if (pathSegments.length < 2) {
      return { isValid: false, error: defaultError };
    }

    if (pathSegments.length > 2) {
      return { isValid: false, error: defaultError };
    }

    const owner = pathSegments[0];
    const repo = pathSegments[1].replace(/\.git$/, "");

    return {
      isValid: true,
      owner,
      repo,
    };
  } catch {
    return { isValid: false, error: defaultError };
  }
}