import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GlassPanel } from './GlassUI';
import { signInWithGoogle } from '../lib/firebase';
import { LogIn, Loader2 } from 'lucide-react';

export function AuthScreen() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none" />
      
      <GlassPanel className="w-full max-w-md p-10 text-center relative z-10 overflow-hidden">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/20 mb-8">
            <span className="font-black text-3xl text-white">P</span>
          </div>
          
          <h1 className="mb-2 text-4xl font-black tracking-tighter text-white uppercase italic">Privachat</h1>
          <p className="mb-10 text-white/30 text-[9px] uppercase font-black tracking-[0.3em]">Encrypted Node Access</p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="flex w-full h-18 items-center justify-center gap-4 rounded-[32px] bg-white px-8 font-black uppercase tracking-widest text-[13px] text-black transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
            Continue with Google
          </motion.button>

        </motion.div>

        <div className="mt-12 pt-8 border-t border-white/5 w-full flex justify-center gap-8 opacity-40">
           <div className="flex flex-col items-center">
             <div className="w-1 h-1 bg-orange-500 rounded-full mb-2" />
             <span className="text-[10px] font-black uppercase tracking-tighter text-white">E2EE</span>
           </div>
           <div className="flex flex-col items-center">
             <div className="w-1 h-1 bg-purple-500 rounded-full mb-2" />
             <span className="text-[10px] font-black uppercase tracking-tighter text-white">M-GRD</span>
           </div>
           <div className="flex flex-col items-center">
             <div className="w-1 h-1 bg-blue-500 rounded-full mb-2" />
             <span className="text-[10px] font-black uppercase tracking-tighter text-white">NODAL</span>
           </div>
        </div>
      </GlassPanel>
    </div>
  );
}
