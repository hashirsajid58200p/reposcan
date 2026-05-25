"use client";

import { motion } from "framer-motion";
import { MetricResult } from "@/lib/types";
import MetricRow from "./MetricRow";

interface BreakdownSectionProps {
  metrics: MetricResult[];
}

export default function BreakdownSection({ metrics }: BreakdownSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full mb-[64px]"
    >
      <div className="text-accent text-[11px] font-bold tracking-[0.15em] uppercase mb-6">
        Breakdown
      </div>
      
      <div className="border-t border-[#1a1a1a]">
        {metrics.map((metric, idx) => (
          <MetricRow key={metric.id} metric={metric} index={idx} />
        ))}
      </div>
    </motion.section>
  );
}