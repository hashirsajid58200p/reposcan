"use client";

import { motion } from "framer-motion";

interface ResultsTopBarProps {
  repoFullName: string;
  onNewScan: () => void;
}

export default function ResultsTopBar({ repoFullName, onNewScan }: ResultsTopBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 w-full z-40 bg-black/90 border-b border-border-default h-16 px-6 md:px-[80px] flex items-center justify-between"
    >
      <div className="font-grotesk font-bold text-[16px] tracking-tight text-text-primary uppercase hidden md:block">
        REPO<span className="text-accent">SCAN</span>
      </div>

      <div className="flex items-center gap-2 font-inter font-bold text-text-primary text-[14px]">
        <span className="w-2 h-2 rounded-none bg-accent animate-pulse" />
        {repoFullName}
      </div>

      <button
        onClick={onNewScan}
        className="font-inter text-[13px] text-text-secondary hover:text-accent transition-colors duration-150 flex items-center gap-1 uppercase tracking-wider"
      >
        <span className="text-[14px]">←</span> New Scan
      </button>
    </motion.div>
  );
}