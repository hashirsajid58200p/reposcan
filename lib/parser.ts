export interface ParsedUrlResult {
  isValid: boolean;
  owner?: string;
  repo?: string;
  error?: string;
}

export function parseGitHubUrl(input: string): ParsedUrlResult {
  const trimmed = input.trim();
  const defaultError = "Invalid URL format. Expected: github.com/owner/repo or owner/repo";

  if (!trimmed) {
    return { isValid: false, error: defaultError };
  }

  // 1. Strip protocols, subdomains, and SSH prefixes
  let cleaned = trimmed
    .replace(/^(https?:\/\/)?(www\.)?/, "") // Remove http://, https://, www.
    .replace(/^git@github\.com:/, "")       // Remove SSH prefix git@github.com:
    .replace(/^git:\/\//, "");               // Remove git://

  // 2. Remove "github.com/" prefix if present
  if (cleaned.startsWith("github.com/")) {
    cleaned = cleaned.substring("github.com/".length);
  }

  // 3. Split remaining path (e.g., owner/repo or owner/repo/issues...)
  const pathSegments = cleaned.split("/").filter(Boolean);

  if (pathSegments.length < 2) {
    return { isValid: false, error: defaultError };
  }

  const owner = pathSegments[0];
  // Remove trailing .git and any query parameters / hash fragments
  const repo = pathSegments[1]
    .replace(/\.git$/, "")
    .split("?")[0]
    .split("#")[0];

  // 4. Validate owner and repo against GitHub character limits
  const validPattern = /^[a-zA-Z0-9_.-]+$/;
  if (!validPattern.test(owner) || !validPattern.test(repo)) {
    return { isValid: false, error: defaultError };
  }

  return {
    isValid: true,
    owner,
    repo,
  };
}