"use client";

import { motion } from "framer-motion";
import { GitHubRepoData } from "@/lib/types";

interface RepoIdentityRowProps {
  repo: GitHubRepoData;
}

export default function RepoIdentityRow({ repo }: RepoIdentityRowProps) {
  const formatNumber = (num: number) => {
    return num > 999 ? (num / 1000).toFixed(1) + "k" : num.toString();
  };

  const [owner, name] = repo.full_name.split("/");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full pt-[64px] pb-[20px]"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div>
          <h2 className="font-grotesk font-bold text-[24px] md:text-[32px] leading-tight mb-2 break-all">
            <span className="text-text-secondary">{owner}</span>
            <span className="text-text-secondary">/</span>
            <span className="text-text-primary">{name}</span>
          </h2>
          <p className="font-inter text-text-secondary text-[14px] max-w-[600px]">
            {repo.description || "No description provided."}
          </p>
        </div>

        <div className="flex items-center gap-6 font-mono text-[14px]">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary font-inter">★</span>
            <span className="text-text-primary">{formatNumber(repo.stargazers_count)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary font-inter">⑂</span>
            <span className="text-text-primary">{formatNumber(repo.forks_count)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-secondary font-inter">👁</span>
            <span className="text-text-primary">{formatNumber(repo.watchers_count)}</span>
          </div>
        </div>
      </div>
      
      <div className="w-full h-[1px] bg-accent" />
    </motion.div>
  );
}