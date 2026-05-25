"use client";

import { motion } from "framer-motion";
import { FixItem } from "@/lib/types";

interface FixListItemProps {
  fix: FixItem;
  index: number;
}

export default function FixListItem({ fix, index }: FixListItemProps) {
  const getPriorityStyles = () => {
    if (fix.priority === "HIGH") return "text-accent";
    if (fix.priority === "MED") return "text-text-primary";
    return "text-text-secondary";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="flex flex-col md:flex-row md:items-start justify-between w-full py-[20px] border-b border-[#1a1a1a] hover:bg-[#ffd600]/5 transition-colors duration-150 gap-4 group"
    >
      <div className="flex items-start gap-4 flex-grow">
        <div className={`font-mono font-bold text-[11px] uppercase mt-1 shrink-0 ${getPriorityStyles()}`}>
          [{fix.priority}]
        </div>

        <div className="flex flex-col">
          <h4 className="font-inter font-bold text-text-primary text-[15px] mb-1">
            {fix.title}
          </h4>
          <p className="font-inter text-text-secondary text-[13px] max-w-[500px]">
            {fix.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span className="font-mono font-bold text-[14px] text-accent">
          +{fix.pointsImpact} pts
        </span>
        <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-150 font-mono hidden md:block">
          →
        </span>
      </div>
    </motion.div>
  );
}