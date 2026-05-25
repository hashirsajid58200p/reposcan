// Raw data fetched from GitHub API
export interface GitHubRepoData {
  name: string;
  full_name: string;          // "owner/repo"
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string | null;
  created_at: string;         // ISO date string
  updated_at: string;         // ISO date string
  pushed_at: string;          // ISO date string
  open_issues_count: number;
  license: { name: string; spdx_id: string } | null;
  owner: {
    login: string;
    avatar_url: string;
  };
  default_branch: string;
}

// Processed commit data
export interface CommitData {
  totalFetched: number;
  lastCommitDate: string;     // ISO date string
  uniqueContributors: number;
  commitsLast30Days: number;
}

// Processed issues data
export interface IssuesData {
  openCount: number;
  closedCount: number;
  ratio: number;              // closed / total
}

// Result of analyzing one metric
export interface MetricResult {
  id: MetricId;
  name: string;               // Display name e.g. "README"
  score: number;              // 0–max for this metric
  maxScore: number;           // Max possible for this metric
  normalizedScore: number;    // 0–10 for display (score/maxScore * 10)
  status: 'pass' | 'warn' | 'fail';
  findings: Finding[];        // Bullet points
}

export type MetricId =
  | 'readme'
  | 'cicd'
  | 'commits'
  | 'issues'
  | 'license'
  | 'contributing';

export interface Finding {
  type: 'good' | 'bad' | 'warn';
  text: string;
}

// A single item in the fix list
export interface FixItem {
  id: string;
  priority: 'HIGH' | 'MED' | 'LOW';
  title: string;
  description: string;
  pointsImpact: number;
}

// The full analysis result returned from /api/analyze
export interface AnalysisResult {
  repo: GitHubRepoData;
  totalScore: number;         // 0–100
  verdict: 'HEALTHY' | 'NEEDS ATTENTION' | 'CRITICAL';
  metrics: MetricResult[];    // always 6 items
  fixList: FixItem[];         // sorted by priority
  analyzedAt: string;         // ISO date string
}

// State managed by useAnalysis hook
export type AnalysisState =
  | { status: 'idle' }
  | { status: 'loading'; loadingMessage: string }
  | { status: 'success'; data: AnalysisResult }
  | { status: 'error'; errorType: ErrorType; message: string };

export type ErrorType = 'invalid_url' | 'not_found' | 'rate_limited' | 'unknown';

// Canvas animation state (for dot speed control)
export interface CanvasAnimationState {
  speedMultiplier: number;    // 1.0 normal, 1.6 during loading
}