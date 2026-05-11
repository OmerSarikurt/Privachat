import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function GlassPanel({ children, className, ...props }: GlassPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-[40px] border border-white/20 bg-white/5 backdrop-blur-[40px] shadow-2xl",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
}

export function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black pointer-events-none">
      {/* Theme Blobs */}
      <motion.div
        animate={{
          x: [-20, 40, -20],
          y: [-30, 30, -30],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -left-[10%] w-[80%] h-[80%] bg-orange-600 rounded-full blur-[140px] opacity-[0.12]"
      />
      <motion.div
        animate={{
          x: [20, -40, 20],
          y: [30, -30, 20],
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[15%] -right-[10%] w-[90%] h-[90%] bg-purple-700 rounded-full blur-[160px] opacity-[0.18]"
      />
      
      {/* Dynamic Floating particles or subtle noise */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
