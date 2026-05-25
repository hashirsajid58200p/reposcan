import {
    MetricResult,
    FixItem,
    AnalysisResult,
    Finding,
    MetricId
} from "./types";
import { RawGitHubData } from "./github";

// Helper to determine status based on score ratio
const getStatus = (score: number, max: number): "pass" | "warn" | "fail" => {
    const ratio = score / max;
    if (ratio >= 0.8) return "pass";
    if (ratio >= 0.4) return "warn";
    return "fail";
};

// Helper to calculate normalized score (0-10)
const normalize = (score: number, max: number): number =>
    Math.round((score / max) * 10);

export function calculateHealthScore(data: RawGitHubData): AnalysisResult {
    const metrics: MetricResult[] = [];
    const fixes: FixItem[] = [];
    let totalScore = 0;

    // 1. README (Max 20)
    let readmeScore = 0;
    const readmeFindings: Finding[] = [];

    if (data.readme) {
        readmeScore += 5;
        readmeFindings.push({ type: "good", text: "README file exists" });

        const length = data.readme.length;
        if (length > 500) {
            readmeScore += 3;
            readmeFindings.push({ type: "good", text: "Length > 500 characters" });
        }
        if (length > 1500) {
            readmeScore += 3;
            readmeFindings.push({ type: "good", text: "Length > 1500 characters" });
        } else if (length <= 500) {
            fixes.push({
                id: "readme-short",
                priority: "MED",
                title: "Expand your README",
                description: "A detailed README increases adoption and clarity.",
                pointsImpact: 5,
            });
        }

        if (data.readme.includes("```")) {
            readmeScore += 2;
            readmeFindings.push({ type: "good", text: "Contains code examples" });
        } else {
            fixes.push({
                id: "readme-code",
                priority: "LOW",
                title: "Add code examples to README",
                description: "Users need to see how your code works quickly.",
                pointsImpact: 2,
            });
        }

        if (data.readme.includes("##")) {
            readmeScore += 2;
        }

        if (data.readme.includes("[![") || data.readme.includes("<img src=\"https://badge")) {
            readmeScore += 2;
            readmeFindings.push({ type: "good", text: "Contains status badges" });
        }

        const lowerReadme = data.readme.toLowerCase();
        if (lowerReadme.includes("install") || lowerReadme.includes("usage") || lowerReadme.includes("getting started")) {
            readmeScore += 3;
            readmeFindings.push({ type: "good", text: "Contains installation/usage guide" });
        }
    } else {
        readmeFindings.push({ type: "bad", text: "No README file found" });
        fixes.push({
            id: "readme-missing",
            priority: "HIGH",
            title: "Create a README.md",
            description: "A README is the entry point to your project. It is absolutely required.",
            pointsImpact: 20,
        });
    }

    metrics.push({
        id: "readme",
        name: "README",
        score: readmeScore,
        maxScore: 20,
        normalizedScore: normalize(readmeScore, 20),
        status: getStatus(readmeScore, 20),
        findings: readmeFindings,
    });

    // 2. CI/CD (Max 15)
    let cicdScore = 0;
    const cicdFindings: Finding[] = [];

    if (data.workflows && data.workflows.length > 0) {
        // Only count actual files, not directories
        const ymlFiles = data.workflows.filter((w: any) => w.name.endsWith(".yml") || w.name.endsWith(".yaml"));

        if (ymlFiles.length > 0) {
            cicdScore += 10;
            cicdFindings.push({ type: "good", text: "GitHub Actions workflows detected" });

            // We do a basic check on workflow names to infer testing/building
            const hasQualityCheck = ymlFiles.some((w: any) => {
                const name = w.name.toLowerCase();
                return name.includes("test") || name.includes("build") || name.includes("lint") || name.includes("ci");
            });

            if (hasQualityCheck) {
                cicdScore += 5;
                cicdFindings.push({ type: "good", text: "Workflows include tests/builds" });
            }
        }
    }

    if (cicdScore === 0) {
        cicdFindings.push({ type: "bad", text: "No CI/CD pipelines configured" });
        fixes.push({
            id: "cicd-missing",
            priority: "HIGH",
            title: "Add a CI/CD workflow",
            description: "Automated testing increases repo trust and catches bugs early.",
            pointsImpact: 10,
        });
    }

    metrics.push({
        id: "cicd",
        name: "CI/CD",
        score: cicdScore,
        maxScore: 15,
        normalizedScore: normalize(cicdScore, 15),
        status: getStatus(cicdScore, 15),
        findings: cicdFindings,
    });

    // 3. COMMITS (Max 20)
    let commitsScore = 0;
    const commitsFindings: Finding[] = [];

    if (data.commits && data.commits.length > 0) {
        const lastCommitDate = new Date(data.commits[0].commit.author.date);
        const now = new Date();
        const daysSinceLastCommit = Math.floor((now.getTime() - lastCommitDate.getTime()) / (1000 * 3600 * 24));

        if (daysSinceLastCommit <= 7) {
            commitsScore += 10; // 5 for 30 days + 5 for 7 days
            commitsFindings.push({ type: "good", text: "Active development (commit within 7 days)" });
        } else if (daysSinceLastCommit <= 30) {
            commitsScore += 5;
            commitsFindings.push({ type: "good", text: "Commit within last 30 days" });
        } else {
            commitsFindings.push({ type: "warn", text: `Last commit was ${daysSinceLastCommit} days ago` });
            fixes.push({
                id: "commits-stale",
                priority: "MED",
                title: "Repository appears inactive",
                description: "Push new commits or update documentation to signal the project is alive.",
                pointsImpact: 10,
            });
        }

        if (data.commits.length >= 10) {
            commitsScore += 5;
            commitsFindings.push({ type: "good", text: "High commit frequency" });
        }

        const uniqueAuthors = new Set(data.commits.map((c: any) => c.commit.author.email));
        if (uniqueAuthors.size > 2) {
            commitsScore += 5;
            commitsFindings.push({ type: "good", text: "Multiple active contributors" });
        }
    } else {
        commitsFindings.push({ type: "bad", text: "No commit history found" });
    }

    metrics.push({
        id: "commits",
        name: "COMMITS",
        score: commitsScore,
        maxScore: 20,
        normalizedScore: normalize(commitsScore, 20),
        status: getStatus(commitsScore, 20),
        findings: commitsFindings,
    });

    // 4. ISSUES (Max 15)
    let issuesScore = 0;
    const issuesFindings: Finding[] = [];
    const openCount = data.repo.open_issues_count;
    const closedCount = data.closedIssues.length; // Max 100 fetched

    if (closedCount > 0) {
        issuesScore += 5;
        issuesFindings.push({ type: "good", text: "Maintainers actively close issues" });
    }

    const totalKnownIssues = openCount + closedCount;
    if (totalKnownIssues > 0) {
        const closedRatio = closedCount / totalKnownIssues;
        if (closedRatio > 0.5) {
            issuesScore += 5;
            issuesFindings.push({ type: "good", text: "More closed issues than open" });
        }
    } else {
        // If a project has zero issues ever, give them the ratio points by default so they aren't penalized
        issuesScore += 5;
    }

    if (openCount < 50) {
        issuesScore += 5;
        issuesFindings.push({ type: "good", text: "Manageable open issue queue" });
    } else if (openCount > 200) {
        issuesScore -= 5;
        issuesFindings.push({ type: "bad", text: "Overwhelming number of open issues (>200)" });
        fixes.push({
            id: "issues-bloat",
            priority: "HIGH",
            title: "Triage open issues",
            description: "Close stale issues. High open issue counts signal an overwhelmed or abandoned project.",
            pointsImpact: 5,
        });
    }

    // Bound score between 0 and 15 (in case of deductions)
    issuesScore = Math.max(0, Math.min(15, issuesScore));

    metrics.push({
        id: "issues",
        name: "ISSUES",
        score: issuesScore,
        maxScore: 15,
        normalizedScore: normalize(issuesScore, 15),
        status: getStatus(issuesScore, 15),
        findings: issuesFindings,
    });

    // 5. LICENSE (Max 15)
    let licenseScore = 0;
    const licenseFindings: Finding[] = [];
    let licenseName = "LICENSE";

    if (data.repo.license) {
        licenseScore += 15;
        licenseName = data.repo.license.name;
        licenseFindings.push({ type: "good", text: `Uses ${licenseName}` });
    } else {
        licenseFindings.push({ type: "bad", text: "No license file found" });
        fixes.push({
            id: "license-missing",
            priority: "HIGH",
            title: "Add a license file",
            description: "Without a license, default copyright laws apply, meaning nobody can legally use or fork your code.",
            pointsImpact: 15,
        });
    }

    metrics.push({
        id: "license",
        name: licenseName.length > 15 ? "LICENSE" : licenseName.toUpperCase(),
        score: licenseScore,
        maxScore: 15,
        normalizedScore: normalize(licenseScore, 15),
        status: getStatus(licenseScore, 15),
        findings: licenseFindings,
    });

    // 6. CONTRIBUTING (Max 15)
    let contributingScore = 0;
    const contribFindings: Finding[] = [];

    if (data.hasContributing) {
        contributingScore += 7;
        contribFindings.push({ type: "good", text: "CONTRIBUTING.md exists" });
    } else {
        fixes.push({
            id: "contrib-missing",
            priority: "MED",
            title: "Add a contributing guide",
            description: "A CONTRIBUTING.md file helps new developers know how to submit PRs.",
            pointsImpact: 7,
        });
    }

    if (data.hasCodeOfConduct) {
        contributingScore += 5;
        contribFindings.push({ type: "good", text: "CODE_OF_CONDUCT.md exists" });
    } else {
        fixes.push({
            id: "coc-missing",
            priority: "LOW",
            title: "Add a Code of Conduct",
            description: "Establishes community guidelines and a welcoming environment.",
            pointsImpact: 5,
        });
    }

    if (data.hasPrTemplateIndicator) {
        contributingScore += 3;
        contribFindings.push({ type: "good", text: "Uses Pull Request templates" });
    }

    if (contributingScore === 0) {
        contribFindings.push({ type: "warn", text: "No community health files found" });
    }

    metrics.push({
        id: "contributing",
        name: "CONTRIBUTING",
        score: contributingScore,
        maxScore: 15,
        normalizedScore: normalize(contributingScore, 15),
        status: getStatus(contributingScore, 15),
        findings: contribFindings,
    });

    // FINAL CALCULATIONS
    totalScore = metrics.reduce((sum, m) => sum + m.score, 0);

    let verdict: AnalysisResult["verdict"] = "HEALTHY";
    if (totalScore < 40) verdict = "CRITICAL";
    else if (totalScore < 75) verdict = "NEEDS ATTENTION";

    // Sort fixes: HIGH -> MED -> LOW
    const priorityWeight = { HIGH: 3, MED: 2, LOW: 1 };
    fixes.sort((a, b) => {
        if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
            return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        return b.pointsImpact - a.pointsImpact;
    });

    return {
        repo: data.repo,
        totalScore,
        verdict,
        metrics,
        fixList: fixes,
        analyzedAt: new Date().toISOString(),
    };
}