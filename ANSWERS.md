# ANSWERS.md

## 1. How to Run

To run this project on a fresh machine:

1. Clone the repository: `git clone <your-repo-url>` and `cd reposcan`
2. Install dependencies: `npm install`
3. Set up the environment: Copy `.env.example` to `.env.local` and add your GitHub Personal Access Token (`GITHUB_TOKEN=...`) to avoid aggressive rate limiting.
4. Start the development server: `npm run dev`
5. Open `http://localhost:3000` in your browser.

## 2. Stack Choice

I chose Next.js 14 (App Router), TypeScript, and Tailwind CSS (v4).

- **Next.js** was crucial because it provides built-in API routes, allowing me to proxy all GitHub API calls server-side. This keeps the GitHub token secure and out of the browser.
- **TypeScript** in strict mode ensures the complex, nested JSON data returned by the GitHub API is handled safely, preventing runtime crashes if properties are missing.
- **Tailwind CSS** allowed for rapid, token-driven styling that strictly adheres to the brutalist design constraints without bloated stylesheets.
- **Typography:** I specifically prioritized the `Inter` and `Roboto` custom fonts over standard system font stacks to guarantee that the UI renders identically across both Linux and Windows environments, maintaining the strict structural integrity of the brutalist design.
- **What would be worse:** A purely client-side React app (Create React App/Vite) would be worse because exposing the GitHub PAT to the client is a massive security risk, and the client would hit the 60 req/hr unauthenticated rate limit almost instantly.

## 3. One Real Edge Case

**Edge Case:** Users pasting malformed URLs or clone URLs instead of browser URLs.
**Location:** `lib/parser.ts` (Lines 35-43)
**What happens without it:** If a user pastes `https://github.com/facebook/react.git` (the clone URL) or adds trailing slashes/paths like `facebook/react/issues`, a naive `.split('/')` approach would pass `.git` or `issues` to the API layer. The GitHub API would return a 404.
**The Fix:** The parser uses the native browser `URL` constructor to safely extract the pathname, strictly validates that only two segments (owner and repo) exist, and explicitly strips trailing `.git` strings using a regex replace.

## 4. AI Usage

I used an AI assistant as a senior pair-programmer for this project.

- **What was asked:** I provided the complete project specification, design tokens, and GitHub API requirements, asking the AI to guide me step-by-step through the implementation.
- **What was changed:** The AI generated the initial boilerplate, the Canvas background logic, the Next.js API route proxy, and the Tailwind component structures. When we ran into a caching issue with the Next.js App Router and a configuration issue with Tailwind v4, I worked with the AI to debug the cache (`rm -rf .next`), update the `tsconfig.json` paths, and rewrite the global CSS to use the new Tailwind v4 `@theme` directive.

## 5. Honest Gap

**The Gap:** The commit and issue health scoring is currently based only on the _first page_ of paginated API results (e.g., the last 30 commits or first 100 closed issues).
**Why it's not good enough:** For massive repositories, looking at only the last 30 commits might unfairly penalize the "unique contributors" metric, or checking only 100 closed issues might skew the open/closed ratio.
**How to fix it:** With one more day, I would implement GraphQL instead of the REST v3 API for the backend fetcher. GitHub's GraphQL API allows fetching deep aggregate counts (like total commits across all time, or total closed issues) in a single optimized network request, which would make the scoring significantly more accurate without sacrificing performance.
