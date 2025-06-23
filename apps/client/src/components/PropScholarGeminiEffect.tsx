"use client";

import { cn } from "@/lib/utils";
import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";
import { TrendingUp, Shield, Target, Zap } from "lucide-react";

const transition = {
  duration: 0,
  ease: "linear" as const,
};

export const PropScholarGeminiEffect = ({
  pathLengths,
  className,
}: {
  pathLengths: MotionValue[];
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.5]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.9]);

  return (
    <div 
      ref={containerRef}
      className={cn("relative py-20 overflow-hidden bg-gradient-to-b from-prop-scholar-deep-navy to-slate-900", className)}
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-prop-scholar-royal-blue/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-prop-scholar-electric-blue/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div 
        style={{ opacity, scale }}
        className="relative z-10 max-w-7xl mx-auto px-4"
      >
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-6"
          >
            <span className="bg-gradient-to-r from-prop-scholar-main-text via-prop-scholar-electric-blue to-prop-scholar-royal-blue bg-clip-text text-transparent">
              Transform Your
            </span>
            <br />
            <span className="text-prop-scholar-amber-yellow">Trading Journey</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-lg md:text-xl text-prop-scholar-secondary-text max-w-3xl mx-auto leading-relaxed"
          >
            Experience the future of prop trading with our advanced evaluation system. 
            <span className="text-prop-scholar-electric-blue font-semibold"> Cut costs by 75% while maximizing your potential.</span>
          </motion.p>
        </div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {[
            { icon: TrendingUp, label: "Success Rate", value: "89%", color: "text-green-400" },
            { icon: Shield, label: "Risk Protection", value: "100%", color: "text-prop-scholar-electric-blue" },
            { icon: Target, label: "Accuracy", value: "94%", color: "text-prop-scholar-amber-yellow" },
            { icon: Zap, label: "Speed", value: "3x Faster", color: "text-purple-400" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/5 border border-prop-scholar-royal-blue/20 rounded-2xl p-6 text-center backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
            >
              <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-sm text-prop-scholar-secondary-text">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-12"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(36, 107, 253, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary-gradient px-8 py-4 rounded-2xl font-bold text-lg text-white shadow-[0_0_30px_rgba(36,107,253,0.4)] hover:shadow-[0_0_50px_rgba(36,107,253,0.6)] transition-all duration-300"
          >
            Start Your Journey
          </motion.button>
        </motion.div>
      </motion.div>

      {/* SVG Animation */}
      <div className="relative w-full h-[400px] overflow-hidden">
        <svg
          width="100%"
          height="400"
          viewBox="0 0 1440 400"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0"
        >
          <defs>
            <linearGradient id="propGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#246BFD" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#00D4FF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FFB400" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="propGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#246BFD" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.3" />
            </linearGradient>
            <filter id="blurEffect">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            </filter>
          </defs>

          {/* Animated Paths */}
          <motion.path
            d="M0 300C150 300 200 280 350 260C500 240 550 220 700 200C850 180 900 160 1050 140C1200 120 1250 100 1440 100"
            stroke="url(#propGradient1)"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            style={{ pathLength: pathLengths[0] }}
            transition={transition}
          />
          
          <motion.path
            d="M0 350C180 330 250 310 400 290C550 270 600 250 750 230C900 210 950 190 1100 170C1250 150 1300 130 1440 130"
            stroke="url(#propGradient2)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            style={{ pathLength: pathLengths[1] }}
            transition={transition}
          />

          <motion.path
            d="M0 250C120 270 180 290 320 310C460 330 520 350 660 370C800 390 860 380 1000 360C1140 340 1200 320 1440 300"
            stroke="#246BFD"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            style={{ pathLength: pathLengths[2] }}
            transition={transition}
            opacity="0.6"
          />

          {/* Background Blurred Paths */}
          <path
            d="M0 300C150 300 200 280 350 260C500 240 550 220 700 200C850 180 900 160 1050 140C1200 120 1250 100 1440 100"
            stroke="#246BFD"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
            filter="url(#blurEffect)"
          />
        </svg>
      </div>
    </div>
  );
}; 