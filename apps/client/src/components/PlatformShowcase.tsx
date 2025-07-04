"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface Platform {
  name: string;
  logo: string;
  description: string;
  category: string;
  featured?: boolean;
}

const platforms: Platform[] = [
  {
    name: "FTMO",
    logo: "/platforms/ftmo.png",
    description: "Leading prop trading firm with comprehensive evaluations",
    category: "Prop Trading",
    featured: true,
  },
  {
    name: "MyForexFunds",
    logo: "/platforms/myforexfunds.png",
    description: "Flexible trading challenges and instant funding",
    category: "Prop Trading",
  },
  {
    name: "The5ers",
    logo: "/platforms/the5ers.png",
    description: "Unique bootstrap and evaluation programs",
    category: "Prop Trading",
  },
  {
    name: "TopStep",
    logo: "/platforms/topstep.png",
    description: "Futures trading combine program",
    category: "Futures",
    featured: true,
  },
  {
    name: "Apex Trader",
    logo: "/platforms/apextrader.png",
    description: "Multi-asset prop trading platform",
    category: "Multi-Asset",
  },
  {
    name: "SurgeTrader",
    logo: "/platforms/surgetrader.png",
    description: "Innovative prop trading solutions",
    category: "Prop Trading",
  },
  {
    name: "Smart Prop Trader",
    logo: "/platforms/smartproptrader.png",
    description: "Smart technology-driven trading",
    category: "Prop Trading",
  },
  {
    name: "FundedNext",
    logo: "/platforms/fundednext.png",
    description: "Next-generation trading challenges",
    category: "Prop Trading",
    featured: true,
  },
];

export const PlatformShowcase = ({ className }: { className?: string }) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const x = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]), {
    stiffness: 400,
    damping: 60,
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.3, 1, 1, 0.3]
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.8, 1, 1, 0.8]
  );

  return (
    <section
      ref={targetRef}
      className={cn(
        "relative py-20  bg-gradient-to-b from-slate-900 to-prop-scholar-deep-navy",
        className
      )}>
      {/* Background Effects */}
      <div className='absolute inset-0'>
        <div className='absolute top-1/3 left-1/3 w-72 h-72 bg-prop-scholar-electric-blue/10 rounded-full blur-3xl animate-pulse' />
        <div className='absolute bottom-1/3 right-1/3 w-96 h-96 bg-prop-scholar-amber-yellow/5 rounded-full blur-3xl animate-pulse delay-1000' />
      </div>

      <motion.div style={{ opacity, scale }} className='relative z-10'>
        {/* Header */}
        <div className='max-w-7xl mx-auto px-4 mb-16 text-center'>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-prop-scholar-royal-blue/20 border border-prop-scholar-royal-blue/30 text-prop-scholar-electric-blue text-sm font-medium mb-8 backdrop-blur-sm'>
            <span>🚀</span>
            <span>Trusted Platforms</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className='text-4xl md:text-6xl lg:text-7xl font-black mb-6'>
            <span className='bg-gradient-to-r from-prop-scholar-main-text to-prop-scholar-electric-blue bg-clip-text text-transparent'>
              Prop Trading
            </span>
            <br />
            <span className='text-prop-scholar-amber-yellow'>Platforms</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className='text-lg md:text-xl text-prop-scholar-secondary-text max-w-3xl mx-auto leading-relaxed'>
            We provide scholarships and funding assistance for all major prop
            trading platforms.
            <span className='text-prop-scholar-electric-blue font-semibold'>
              {" "}
              Choose your platform and let us handle the costs.
            </span>
          </motion.p>
        </div>

        {/* Scrolling Platform Cards */}
        <div className='relative overflow-hidden'>
          <motion.div style={{ x }} className='flex gap-8 px-4'>
            {[...platforms, ...platforms].map((platform, index) => (
              <PlatformCard
                key={`${platform.name}-${index}`}
                platform={platform}
                index={index}
              />
            ))}
          </motion.div>
        </div>

        {/* Gradient Overlays */}
        <div className='absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none' />
        <div className='absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-prop-scholar-deep-navy to-transparent z-10 pointer-events-none' />
      </motion.div>
    </section>
  );
};

const PlatformCard = ({
  platform,
  index,
}: {
  platform: Platform;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(
        "relative flex-shrink-0 w-80 h-96 rounded-3xl overflow-hidden group cursor-pointer",
        "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm",
        "border border-prop-scholar-royal-blue/20",
        "shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        "transition-all duration-300",
        platform.featured && "ring-2 ring-prop-scholar-amber-yellow/30"
      )}>
      {/* Featured Badge */}
      {platform.featured && (
        <div className='absolute top-4 right-4 z-20'>
          <div className='px-3 py-1 rounded-full bg-prop-scholar-amber-yellow text-prop-scholar-deep-navy text-xs font-bold'>
            Featured
          </div>
        </div>
      )}

      {/* Platform Logo Placeholder */}
      <div className='relative h-48 bg-gradient-to-br from-prop-scholar-royal-blue/20 to-prop-scholar-electric-blue/10 flex items-center justify-center'>
        <div className='w-32 h-32 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm'>
          <span className='text-2xl font-black text-prop-scholar-main-text'>
            {platform.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className='p-6 space-y-4'>
        <div>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-xl font-bold text-prop-scholar-main-text'>
              {platform.name}
            </h3>
            <span className='text-xs px-2 py-1 rounded-full bg-prop-scholar-royal-blue/20 text-prop-scholar-electric-blue'>
              {platform.category}
            </span>
          </div>
          <p className='text-prop-scholar-secondary-text text-sm leading-relaxed'>
            {platform.description}
          </p>
        </div>

        {/* Action Button */}
        <button className='w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-prop-scholar-royal-blue/20 text-prop-scholar-electric-blue border border-prop-scholar-royal-blue/30 transition-all duration-200'>
          <span className='font-medium'>Learn More</span>
          <ArrowRight className='h-4 w-4' />
        </button>
      </div>
    </motion.div>
  );
};
