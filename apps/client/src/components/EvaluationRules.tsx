"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle, Trophy, Target, Clock, Shield, TrendingUp, Zap, Users } from "lucide-react";

interface RuleData {
  rule: string;
  phase1: string;
  phase2?: string;
}

const oneStepRules: RuleData[] = [
  { rule: "Profit Target", phase1: "10%" },
  { rule: "Time Period", phase1: "Unlimited" },
  { rule: "Leverage", phase1: "Upto 1:50" },
  { rule: "Weekend Holding", phase1: "Yes" },
  { rule: "News Holding + Trading", phase1: "Yes" },
  { rule: "Lot Limit Rule", phase1: "None" },
  { rule: "Maximum Drawdown", phase1: "6%" },
  { rule: "Daily Drawdown", phase1: "3%" },
  { rule: "Minimum Trading Days", phase1: "0 Days" },
  { rule: "Consistency Rule", phase1: "45%" },
];

const twoStepRules: RuleData[] = [
  { rule: "Profit Target", phase1: "8%", phase2: "5%" },
  { rule: "Time Period", phase1: "Unlimited", phase2: "Unlimited" },
  { rule: "Leverage", phase1: "Upto 1:100", phase2: "Upto 1:100" },
  { rule: "Weekend Holding", phase1: "Yes", phase2: "Yes" },
  { rule: "News Holding + Trading", phase1: "Yes", phase2: "Yes" },
  { rule: "Lot Limit Rule", phase1: "None", phase2: "None" },
  { rule: "Maximum Drawdown", phase1: "8%", phase2: "8%" },
  { rule: "Daily Drawdown", phase1: "4%", phase2: "4%" },
  { rule: "Consistency Rule", phase1: "45%", phase2: "45%" },
];

const ruleIcons: Record<string, any> = {
  "Profit Target": Target,
  "Time Period": Clock,
  "Leverage": TrendingUp,
  "Weekend Holding": Shield,
  "News Holding + Trading": Zap,
  "Lot Limit Rule": Users,
  "Maximum Drawdown": Shield,
  "Daily Drawdown": Shield,
  "Minimum Trading Days": Clock,
  "Consistency Rule": CheckCircle,
};

export const EvaluationRules = ({ className }: { className?: string }) => {
  const [activeTab, setActiveTab] = useState<"1step" | "2step">("2step");

  const currentRules = activeTab === "1step" ? oneStepRules : twoStepRules;

  return (
    <section className={cn("relative py-20 bg-gradient-to-b from-prop-scholar-deep-navy to-slate-900", className)}>
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-prop-scholar-electric-blue/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-prop-scholar-amber-yellow/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-prop-scholar-royal-blue/20 border border-prop-scholar-royal-blue/30 text-prop-scholar-electric-blue text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <Trophy className="h-4 w-4" />
            <span>Evaluation Programs</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-6"
          >
            <span className="bg-gradient-to-r from-prop-scholar-main-text to-prop-scholar-electric-blue bg-clip-text text-transparent">
              PropScholar
            </span>
            <br />
            <span className="text-prop-scholar-amber-yellow">Evaluations</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-lg md:text-xl text-prop-scholar-secondary-text max-w-3xl mx-auto leading-relaxed"
          >
            <span className="text-prop-scholar-electric-blue font-semibold">Designed according to your wish and fair competency.</span>
            <br />Choose between our streamlined 1-step or comprehensive 2-step evaluation programs.
          </motion.p>
        </div>

        {/* Tab Selector */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white/5 backdrop-blur-sm border border-prop-scholar-royal-blue/20 rounded-2xl p-2 flex gap-2">
            {[
              { id: "2step", label: "2 STEP", featured: true },
              { id: "1step", label: "1 STEP", featured: false }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "1step" | "2step")}
                className={cn(
                  "px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 relative",
                  activeTab === tab.id
                    ? "bg-white text-prop-scholar-deep-navy shadow-lg"
                    : "text-prop-scholar-secondary-text hover:text-prop-scholar-main-text"
                )}
              >
                {tab.label}
                {tab.featured && activeTab === tab.id && (
                  <div className="absolute -top-2 -right-2 bg-prop-scholar-amber-yellow text-prop-scholar-deep-navy text-xs px-2 py-1 rounded-full font-black">
                    Popular
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Evaluation Table */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-prop-scholar-royal-blue/20 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-prop-scholar-royal-blue/20 to-prop-scholar-electric-blue/20 border-b border-prop-scholar-royal-blue/30">
              <div className="grid grid-cols-3 gap-4 p-6">
                <div className="text-prop-scholar-secondary-text font-bold text-lg">RULES</div>
                <div className="text-center">
                  <div className="bg-prop-scholar-royal-blue/30 rounded-xl p-3 mb-2">
                    <div className="text-prop-scholar-main-text font-black text-lg mb-1">PHASE 1</div>
                    <div className="text-prop-scholar-electric-blue text-sm font-medium">
                      {activeTab === "1step" ? "Evaluation" : "Challenge"}
                    </div>
                  </div>
                </div>
                {activeTab === "2step" && (
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-prop-scholar-electric-blue/30 to-prop-scholar-amber-yellow/20 rounded-xl p-3 mb-2">
                      <div className="text-prop-scholar-main-text font-black text-lg mb-1">PHASE 2</div>
                      <div className="text-prop-scholar-amber-yellow text-sm font-medium">Verification</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Table Body */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="divide-y divide-prop-scholar-royal-blue/10"
              >
                {currentRules.map((rule, index) => {
                  const IconComponent = ruleIcons[rule.rule] || Target;
                  return (
                    <motion.div
                      key={rule.rule}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className={cn(
                        "grid gap-4 p-6 hover:bg-white/5 transition-colors duration-200",
                        activeTab === "1step" ? "grid-cols-2" : "grid-cols-3"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-prop-scholar-royal-blue/20 p-2 rounded-lg">
                          <IconComponent className="h-5 w-5 text-prop-scholar-electric-blue" />
                        </div>
                        <span className="font-semibold text-prop-scholar-main-text">{rule.rule}</span>
                      </div>
                      
                      <div className="text-center">
                        <div className="bg-prop-scholar-royal-blue/10 rounded-lg p-3">
                          <span className="text-prop-scholar-main-text font-bold text-lg">{rule.phase1}</span>
                        </div>
                      </div>
                      
                      {activeTab === "2step" && rule.phase2 && (
                        <div className="text-center">
                          <div className="bg-gradient-to-r from-prop-scholar-electric-blue/10 to-prop-scholar-amber-yellow/10 rounded-lg p-3 border border-prop-scholar-electric-blue/20">
                            <span className="text-prop-scholar-main-text font-bold text-lg">{rule.phase2}</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-prop-scholar-royal-blue/10 to-prop-scholar-electric-blue/10 backdrop-blur-sm border border-prop-scholar-royal-blue/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-prop-scholar-main-text mb-4">
              Ready to Start Your Evaluation?
            </h3>
            <p className="text-prop-scholar-secondary-text mb-6">
              Join thousands of successful traders who chose PropScholar for their evaluation journey.
            </p>
            <button className="bg-primary-gradient px-8 py-4 rounded-xl font-bold text-white shadow-[0_0_30px_rgba(36,107,253,0.4)] hover:shadow-[0_0_50px_rgba(36,107,253,0.6)] transition-all duration-300">
              Start Evaluation
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}; 