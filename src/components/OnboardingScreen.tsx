import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, ArrowRight, User, Loader2 } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !displayName.trim()) return;
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        setupComplete: true,
        createdAt: serverTimestamp(),
      });
      onComplete();
    } catch (error) {
      console.error('Onboarding failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-black p-10 pt-20 overflow-hidden relative">
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none" />
      
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
              className="text-center"
            >
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto mb-10 w-24 h-24 bg-gradient-to-tr from-orange-500 to-orange-400 rounded-[40px] flex items-center justify-center shadow-[0_20px_40px_rgba(249,115,22,0.3)] relative"
              >
                <div className="absolute inset-0 bg-white/20 rounded-[40px] blur-xl opacity-50" />
                <Shield className="h-10 w-10 text-white relative z-10" />
              </motion.div>
              
              <h1 className="text-4xl font-black text-white mb-4 tracking-tighter leading-none">INITIALIZE<br/>NETWORK</h1>
              <p className="text-white/40 text-[13px] leading-relaxed mb-14 uppercase font-black tracking-widest px-4">
                Welcome to the mesh. Secure your node identity before transmission.
              </p>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(2)}
                className="w-full h-18 rounded-[28px] bg-white text-black font-black uppercase tracking-widest text-[13px] flex items-center justify-center gap-3 shadow-2xl transition-all group"
              >
                Proceed to Identity <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              className="w-full"
            >
              <div className="mb-12">
                <h2 className="text-3xl font-black text-white mb-2 leading-none tracking-tight">NODE ALIAS</h2>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-orange-500 rounded-full" />
                  <p className="text-orange-500/50 text-[10px] uppercase font-black tracking-widest">Public Spectrum ID</p>
                </div>
              </div>

              <div className="relative mb-10">
                <div className="absolute left-6 top-1/2 -translate-y-1/2">
                  <User className="h-5 w-5 text-white/30" />
                </div>
                <input 
                  autoFocus
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Spectral_Node_01"
                  className="w-full h-20 bg-white/5 border border-white/10 rounded-[32px] pl-16 pr-6 text-xl text-white font-bold outline-none focus:border-orange-500/40 focus:bg-white/10 transition-all shadow-inner"
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!displayName.trim() || isSubmitting}
                onClick={handleSubmit}
                className="w-full h-18 rounded-[28px] bg-orange-500 text-white font-black uppercase tracking-widest text-[13px] shadow-[0_15px_30px_rgba(249,115,22,0.3)] transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 overflow-hidden relative"
              >
                {isSubmitting ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Confirm Identity
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pb-16 text-center relative z-10">
         <div className="flex items-center justify-center gap-3 mb-4">
            {[1, 2].map(i => (
              <motion.div 
                key={i} 
                animate={{ width: step === i ? 40 : 8, backgroundColor: step === i ? '#f97316' : '#ffffff20' }}
                className="h-1.5 rounded-full" 
              />
            ))}
         </div>
         <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.3em]">Protocol Phase {step}</p>
      </div>
    </div>
  );
}
