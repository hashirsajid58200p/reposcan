"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface HealthScoreSectionProps {
  score: number;
  verdict: "HEALTHY" | "NEEDS ATTENTION" | "CRITICAL";
}

export default function HealthScoreSection({ score, verdict }: HealthScoreSectionProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200; 
    const incrementTime = 20;
    const totalSteps = duration / incrementTime;
    const stepValue = score / totalSteps;

    const timer = setInterval(() => {
      start += stepValue;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [score]);

  const getVerdictColor = () => {
    if (verdict === "HEALTHY") return "text-accent";
    if (verdict === "NEEDS ATTENTION") return "text-text-secondary";
    return "text-text-primary";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="w-full py-[40px] flex flex-col items-start"
    >
      <div className="text-accent text-[11px] font-bold tracking-[0.15em] uppercase mb-4">
        Overall Score
      </div>
      
      <div className="flex items-baseline gap-4 mb-4">
        <span className="font-mono font-bold text-[80px] md:text-[120px] leading-none text-text-primary tracking-tighter">
          {displayScore}
        </span>
        <span className="font-mono text-[24px] md:text-[40px] text-text-secondary leading-none">
          / 100
        </span>
      </div>

      <div className="w-full h-[6px] bg-bg-tertiary mb-4 overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute top-0 left-0 h-full bg-accent"
        />
      </div>

      <div className={`font-inter font-bold text-[14px] uppercase tracking-wider ${getVerdictColor()}`}>
        {verdict}
      </div>
    </motion.div>
  );
}