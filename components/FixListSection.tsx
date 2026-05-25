"use client";

import { motion } from "framer-motion";
import { FixItem } from "@/lib/types";
import FixListItem from "./FixListItem";

interface FixListSectionProps {
  fixes: FixItem[];
}

export default function FixListSection({ fixes }: FixListSectionProps) {
  if (fixes.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="w-full pb-[64px]"
    >
      <div className="mb-6">
        <div className="text-accent text-[11px] font-bold tracking-[0.15em] uppercase mb-1">
          Fix List
        </div>
        <div className="font-inter text-text-secondary text-[13px]">
          Sorted by impact on your score.
        </div>
      </div>
      
      <div className="border-t border-[#1a1a1a]">
        {fixes.map((fix, idx) => (
          <FixListItem key={fix.id} fix={fix} index={idx} />
        ))}
      </div>
    </motion.section>
  );
}