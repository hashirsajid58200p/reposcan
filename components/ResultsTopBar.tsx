"use client";

import { motion } from "framer-motion";
import Image from "next/image";

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
      <div className="hidden md:flex items-center">
        <Image
          src="/logo.png"
          alt="RepoScan"
          width={75}
          height={30}
          priority
          className="object-contain"
        />
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