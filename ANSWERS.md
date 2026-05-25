# ANSWERS.md

## 1. How to Run

To run this project on a fresh machine:

1. Clone the repository: `git clone <your-repo-url>` and `cd reposcan`
2. Install dependencies: `npm install`
3. Set up the environment: Copy `.env.example` to `.env.local` and add your GitHub Personal Access Token (`GITHUB_TOKEN=...`) to avoid aggressive rate limiting.
4. Start the development server: `npm run dev`
5. Open `http://localhost:3000` in your browser.

## 2. Stack Choice

I chose Next.js 15 (App Router), TypeScript, and Tailwind CSS (v4).

* **Next.js** was crucial because it provides built-in API routes, allowing me to proxy all GitHub API calls server-side. This keeps the GitHub token secure and out of the browser.
* **TypeScript** in strict mode ensures the complex, nested JSON data returned by the GitHub API is handled safely, preventing runtime crashes if properties are missing.
* **Tailwind CSS** allowed for rapid, token-driven styling that strictly adheres to the brutalist design constraints without bloated stylesheets.
* **Typography:** I specifically prioritized the `Inter` and `Roboto` custom fonts over standard system font stacks to guarantee that the UI renders identically across both Linux and Windows environments, maintaining the strict structural integrity of the brutalist design.
* **Security & Proxy Routing:** I utilized Next.js Route Handlers (`app/api/search/route.ts`) to proxy the GitHub Search API. This architectural choice ensures the `GITHUB_TOKEN` is securely injected server-side and never exposed to the client, while allowing the client to execute real-time autocomplete queries safely.
* **What would be worse:** A purely client-side React app (Create React App/Vite) would be worse because exposing the GitHub PAT to the client is a massive security risk, and the client would hit the 60 req/hr unauthenticated rate limit almost instantly.

## 3. One Real Edge Case

* **Edge Case 1:** Users pasting malformed URLs or clone URLs instead of browser URLs.
  * **Location:** `lib/parser.ts` (Lines 1-55)
  * **What happens without it:** If a user pastes `https://github.com/facebook/react.git` (the clone URL) or adds trailing slashes/paths like `facebook/react/issues`, a naive `.split('/')` approach would pass `.git` or `issues` to the API layer. The GitHub API would return a 404.
  * **The Fix:** The parser uses robust regex pattern cleaning to extract the exact `owner` and `repo` segments, strips protocol headers (`http://`, `https://`, `git://`), handles SSH formats (`git@github.com:`), removes query strings or hash fragments, and explicitly strips trailing `.git` extensions.

* **Edge Case 2:** Real-time search rate limiting.
  * **The Problem:** The GitHub Search API has a strict limit of 30 requests per minute. If a user types "vercel", firing an API request on every keystroke would instantly result in a 429 Too Many Requests error.
  * **The Fix:** I implemented a custom `setTimeout` debounce (400ms) inside the `InputBar`'s `useEffect` hook. This ensures the API call is only triggered after the user pauses typing, completely avoiding rate limit violations while maintaining a fluid UX.

## 4. AI Usage

I used an AI assistant as a senior pair-programmer for this project.

* **What was asked:** I provided the complete project specification, design tokens, and GitHub API requirements, asking the AI to guide me step-by-step through the implementation.
* **What was changed:** The AI generated the initial boilerplate, the Canvas background logic, the Next.js API route proxy, and the Tailwind component structures. When we ran into a caching issue with the Next.js App Router and a configuration issue with Tailwind v4, I worked with the AI to debug the cache (`rm -rf .next`), update the `tsconfig.json` paths, and rewrite the global CSS to use the new Tailwind v4 `@theme` directive.
* **Complex UI Math:** I leaned on the AI to help pair-program the mathematical logic for the custom HTML5 Canvas background. I directed the AI to help me calculate the directional tails using `createLinearGradient` and the particle glow effects using `shadowBlur`, which saved hours of manual Canvas API trial-and-error.
* **Debounce Logic:** I also used the AI to help architect the debounced search dropdown, specifically to ensure the React `useEffect` cleanup function properly cleared the timeout to prevent memory leaks during fast typing.

## 5. Honest Gap

* **The Gap:** The commit and issue health scoring is currently based only on the _first page_ of paginated API results (e.g., the last 30 commits or first 100 closed issues).
* **Why it's not good enough:** For massive repositories, looking at only the last 30 commits might unfairly penalize the "unique contributors" metric, or checking only 100 closed issues might skew the open/closed ratio.
* **How to fix it:** With one more day, I would implement GraphQL instead of the REST v3 API for the backend fetcher. GitHub's GraphQL API allows fetching deep aggregate counts (like total commits across all time, or total closed issues) in a single optimized network request, which would make the scoring significantly more accurate without sacrificing performance.
