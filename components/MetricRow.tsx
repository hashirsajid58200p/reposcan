"use client";

import { motion } from "framer-motion";
import { MetricResult } from "@/lib/types";

interface MetricRowProps {
  metric: MetricResult;
  index: number;
}

export default function MetricRow({ metric, index }: MetricRowProps) {
  const getStatusColor = () => {
    if (metric.status === "pass") return "text-accent";
    if (metric.status === "warn") return "text-text-secondary";
    return "text-text-primary";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="flex flex-col md:flex-row md:items-center justify-between w-full py-[20px] border-b border-[#1a1a1a] hover:bg-black/60 transition-colors duration-150 gap-4 md:gap-0 group"
    >
      <div className="w-[200px] font-grotesk font-bold text-[15px] text-text-primary uppercase tracking-tight">
        {metric.name}
      </div>

      <div className="flex-grow max-w-[300px] h-[4px] bg-bg-tertiary relative overflow-hidden hidden md:block">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(metric.score / metric.maxScore) * 100}%` }}
          transition={{ duration: 1, delay: 0.2 + index * 0.06, ease: "easeOut" }}
          className="absolute top-0 left-0 h-full bg-accent"
        />
      </div>

      <div className="flex justify-between md:justify-end w-full md:w-[200px]">
        <div className="w-[80px] text-left md:text-right font-mono text-[14px] text-text-primary">
          {metric.score} / {metric.maxScore}
        </div>

        <div className={`w-[80px] text-right font-inter font-bold text-[12px] uppercase tracking-wider ${getStatusColor()}`}>
          {metric.status}
        </div>
      </div>
    </motion.div>
  );
}