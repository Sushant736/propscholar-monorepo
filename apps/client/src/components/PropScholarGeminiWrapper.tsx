"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, MotionValue } from "framer-motion";
import { PropScholarGeminiEffect } from "./PropScholarGeminiEffect";

export const PropScholarGeminiWrapper = ({ className }: { className?: string }) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  // Create path length animations with different speeds for variety
  const pathLengths: MotionValue<number>[] = [
    useTransform(scrollYProgress, [0, 0.6], [0, 1]),
    useTransform(scrollYProgress, [0.1, 0.7], [0, 1]),
    useTransform(scrollYProgress, [0.2, 0.8], [0, 1]),
    useTransform(scrollYProgress, [0.3, 0.9], [0, 1]),
    useTransform(scrollYProgress, [0.4, 1], [0, 1]),
  ];

  return (
    <div ref={targetRef} className="relative">
      <PropScholarGeminiEffect 
        pathLengths={pathLengths}
        className={className}
      />
    </div>
  );
}; 