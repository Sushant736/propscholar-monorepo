"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";

import React, { useRef, useState } from "react";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: (link: string) => void; // Updated to pass the link
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest: number) => {
    setVisible(latest > 100);
  });

  return (
    <motion.div
      ref={ref}
      className={cn("fixed inset-x-0 top-0 z-50 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(20px)" : "blur(0px)",
        boxShadow: visible
          ? "0 0 40px rgba(36, 107, 253, 0.15), 0 1px 1px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(36, 107, 253, 0.1)"
          : "none",
        backgroundColor: visible ? "rgba(11, 17, 32, 0.95)" : "transparent",
        borderColor: visible ? "rgba(36, 107, 253, 0.3)" : "transparent",
        width: visible ? "95%" : "100%",
        y: visible ? 10 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      style={{
        minWidth: "320px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-2xl border backdrop-blur-md px-6 py-3 lg:flex",
        visible ? "border-prop-scholar-secondary-text/10 bg-prop-scholar-deep-navy/80" : "border-transparent bg-transparent",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-1 text-sm font-medium transition duration-200 lg:flex",
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={() => onItemClick?.(item.link)} // Updated to pass the link
          className="relative px-4 py-2 text-prop-scholar-secondary-text hover:text-prop-scholar-main-text transition-colors duration-200"
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-xl bg-prop-scholar-royal-blue/20 border border-prop-scholar-royal-blue/30"
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
            />
          )}
          <span className="relative z-20 font-medium">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(20px)" : "blur(0px)",
        boxShadow: visible
          ? "0 0 40px rgba(36, 107, 253, 0.15), 0 1px 1px rgba(0, 0, 0, 0.1)"
          : "none",
        backgroundColor: visible ? "rgba(11, 17, 32, 0.95)" : "transparent",
        borderColor: visible ? "rgba(36, 107, 253, 0.3)" : "transparent",
        width: visible ? "95%" : "100%",
        paddingRight: visible ? "16px" : "16px",
        paddingLeft: visible ? "16px" : "16px",
        borderRadius: visible ? "16px" : "20px",
        y: visible ? 10 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between border backdrop-blur-md px-4 py-3 lg:hidden",
        visible ? "border-prop-scholar-secondary-text/10 bg-prop-scholar-deep-navy/90" : "border-transparent bg-transparent",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-2xl border border-prop-scholar-royal-blue/20 bg-prop-scholar-deep-navy/95 px-6 py-8 shadow-[0_0_40px_rgba(36,107,253,0.15)] backdrop-blur-xl",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative z-20 p-2 rounded-lg hover:bg-prop-scholar-royal-blue/20 transition-colors duration-200"
    >
      {isOpen ? (
        <IconX className="h-5 w-5 text-prop-scholar-main-text" />
      ) : (
        <IconMenu2 className="h-5 w-5 text-prop-scholar-main-text" />
      )}
    </motion.button>
  );
};

export const NavbarLogo = () => {
  return (
    <a
      href="/"
      className="relative z-20 flex items-center space-x-3 px-2 py-1 text-sm font-bold"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary-gradient rounded-lg blur-sm opacity-50"></div>
        <div className="relative bg-primary-gradient p-2 rounded-lg">
          <span className="text-white font-black text-lg">PS</span>
        </div>
      </div>
      <span className="bg-gradient-to-r from-prop-scholar-main-text to-prop-scholar-electric-blue bg-clip-text text-transparent font-black text-xl">
        Prop Scholar
      </span>
    </a>
  );
};

export const NavbarButton = ({
  href,
  as: Component = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: "a" | "button" | React.ComponentType<any>;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "accent" | "gradient";
} & React.HTMLAttributes<HTMLElement>) => {
  const baseStyles =
    "px-6 py-2.5 rounded-xl font-semibold text-sm relative cursor-pointer transition-all duration-200 inline-block text-center border";

  const variantStyles = {
    primary:
      "bg-prop-scholar-royal-blue hover:bg-prop-scholar-electric-blue text-white border-prop-scholar-royal-blue hover:border-prop-scholar-electric-blue shadow-[0_0_20px_rgba(36,107,253,0.3)] hover:shadow-[0_0_30px_rgba(36,107,253,0.5)] hover:-translate-y-0.5",
    secondary:
      "bg-transparent hover:bg-prop-scholar-royal-blue/10 text-prop-scholar-secondary-text hover:text-prop-scholar-main-text border-prop-scholar-secondary-text/30 hover:border-prop-scholar-royal-blue/50",
    accent:
      "bg-prop-scholar-amber-yellow hover:bg-prop-scholar-amber-yellow/90 text-prop-scholar-deep-navy border-prop-scholar-amber-yellow shadow-[0_0_20px_rgba(255,180,0,0.3)] hover:shadow-[0_0_30px_rgba(255,180,0,0.5)] hover:-translate-y-0.5 font-bold",
    gradient:
      "bg-primary-gradient hover:opacity-90 text-white border-transparent shadow-[0_0_25px_rgba(36,107,253,0.4)] hover:shadow-[0_0_35px_rgba(36,107,253,0.6)] hover:-translate-y-0.5",
  };

  const componentProps = {
    ...(href && { href }),
    className: cn(baseStyles, variantStyles[variant], className),
    ...props,
  };

  return (
    <Component {...componentProps}>
      {children}
    </Component>
  );
};
