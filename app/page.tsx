"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAnalysis } from "@/hooks/useAnalysis";

// Landing Components
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import LoadingState from "@/components/LoadingState";
import ErrorBanner from "@/components/ErrorBanner";

// Results Components
import ResultsTopBar from "@/components/ResultsTopBar";
import RepoIdentityRow from "@/components/RepoIdentityRow";
import HealthScoreSection from "@/components/HealthScoreSection";
import BreakdownSection from "@/components/BreakdownSection";
import FixListSection from "@/components/FixListSection";

export default function Home() {
  const { state, analyzeRepo, resetAnalysis } = useAnalysis();

  return (
    <main className="flex flex-col min-h-screen w-full">
      <AnimatePresence mode="wait">
        {state.status !== "success" ? (
          // STATE 1: LANDING & LOADING & ERROR
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -64 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative w-full min-h-screen flex flex-col"
          >
            <Header />
            
            <HeroSection 
              onSubmit={analyzeRepo} 
              isLoading={state.status === "loading"} 
            />

            {/* Absolute positioning injects Loading/Error directly below the input area */}
            <div className="absolute top-1/2 left-6 md:left-[80px] w-full max-w-[600px] mt-[80px] z-20 pointer-events-auto">
              <AnimatePresence mode="wait">
                {state.status === "loading" && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <LoadingState message={state.loadingMessage} />
                  </motion.div>
                )}
                {state.status === "error" && (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ErrorBanner
                      type={state.errorType}
                      message={state.message}
                      onDismiss={resetAnalysis}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          // STATE 2: RESULTS
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full flex flex-col min-h-screen pb-20"
          >
            <ResultsTopBar
              repoFullName={state.data.repo.full_name}
              onNewScan={resetAnalysis}
            />
            
            <div className="px-6 md:px-[80px] max-w-[1000px] w-full mx-auto flex flex-col">
              <RepoIdentityRow repo={state.data.repo} />
              <HealthScoreSection score={state.data.totalScore} verdict={state.data.verdict} />
              <BreakdownSection metrics={state.data.metrics} />
              <FixListSection fixes={state.data.fixList} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}