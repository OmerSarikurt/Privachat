import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function IPhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative group [perspective:1000px]">
      <motion.div 
        animate={{ rotateY: [-0.5, 0.5, -0.5], rotateX: [0.5, -0.5, 0.5] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="relative mx-auto border-[#1c1c1e] bg-[#1c1c1e] border-[12px] rounded-[4rem] h-[844px] w-[390px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden ring-1 ring-white/10"
      >
        {/* Glass Reflections */}
        <div className="absolute inset-x-0 top-0 h-1/2 z-[60] pointer-events-none opacity-[0.03] bg-gradient-to-tr from-white to-transparent" />
        
        {/* Dynamic Island */}
        <div className="absolute top-0 inset-x-0 h-12 flex justify-center z-50 pointer-events-none">
          <motion.div 
            animate={{ width: ["120px", "126px", "120px"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="mt-3.5 h-8 bg-black rounded-full flex items-center justify-between px-5 ring-1 ring-white/5 shadow-2xl"
          >
             <div className="w-2.5 h-2.5 bg-[#0a0a0d] rounded-full shadow-inner ring-1 ring-white/5 opacity-80" />
             <div className="flex gap-1.5 items-center">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse blur-[1px]" />
                <div className="w-2 h-2 bg-[#0d0d0f] rounded-full" />
             </div>
          </motion.div>
        </div>

        {/* Screen */}
        <div className="flex-1 bg-black relative overflow-hidden rounded-[3rem] border border-white/5">
          {children}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2.5 inset-x-0 flex justify-center z-50 pointer-events-none">
          <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1], width: ["130px", "135px", "130px"] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="h-1.5 bg-white rounded-full blur-[0.3px]"
          />
        </div>
      </motion.div>
    </div>
  );
}
