import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Bell, Lock, EyeOff } from 'lucide-react';
import { notificationService } from '../lib/notifications';

export function PrivacyView() {
  const [notifsEnabled, setNotifsEnabled] = useState(notificationService.hasPermission);

  const toggleNotifications = async () => {
    const granted = await notificationService.requestPermission();
    setNotifsEnabled(granted);
  };

  return (
    <div className="flex h-full flex-col bg-black p-8 relative overflow-y-auto pb-24">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
      
      <div className="mb-12 mt-12 relative z-10">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-1 uppercase">Safety</h1>
        <div className="flex items-center gap-2">
           <div className="w-8 h-0.5 bg-orange-500 rounded-full" />
           <p className="text-white/30 text-[10px] uppercase font-black tracking-widest leading-none">Military-Grade Protocol</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="group flex items-center justify-between rounded-[32px] bg-white/5 border border-white/10 p-5 backdrop-blur-3xl transition-all hover:bg-white/10">
          <div className="flex items-center gap-4">
             <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-orange-500/10 border border-orange-500/20 shadow-inner">
                <Bell className="h-6 w-6 text-orange-500" />
             </div>
             <div>
                <h3 className="font-bold text-white text-sm tracking-tight">Mesh Alerts</h3>
                <p className="text-[11px] text-white/30 leading-tight">Secured push routing.</p>
             </div>
          </div>
          <button 
            onClick={toggleNotifications}
            className={`h-7 w-12 rounded-full transition-all relative ${notifsEnabled ? 'bg-orange-500' : 'bg-white/10 ring-1 ring-white/5'}`}
          >
            <motion.div 
              animate={{ x: notifsEnabled ? 20 : 4 }}
              className="absolute top-1.5 h-4 w-4 rounded-full bg-white shadow-lg" 
            />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-[32px] bg-white/5 border border-white/10 p-5 backdrop-blur-3xl opacity-60">
          <div className="flex items-center gap-4">
             <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-purple-500/10 border border-purple-500/20">
                <Lock className="h-6 w-6 text-purple-500" />
             </div>
             <div>
                <h3 className="font-bold text-white text-sm tracking-tight">AES-256 GCM</h3>
                <p className="text-[11px] text-white/30">Authenticated encryption.</p>
             </div>
          </div>
          <div className="text-[9px] bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-purple-500/30">Active</div>
        </div>

        <div className="flex items-center justify-between rounded-[32px] bg-white/5 border border-white/10 p-5 backdrop-blur-3xl opacity-60">
          <div className="flex items-center gap-4">
             <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-blue-500/10 border border-blue-500/20">
                <EyeOff className="h-6 w-6 text-blue-500" />
             </div>
             <div>
                <h3 className="font-bold text-white text-sm tracking-tight">Stealth Mesh</h3>
                <p className="text-[11px] text-white/30">Identity obfuscation.</p>
             </div>
          </div>
          <div className="text-[9px] bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-blue-500/30">Auto</div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 p-8 rounded-[44px] border border-orange-500/20 bg-orange-500/5 backdrop-blur-3xl relative overflow-hidden"
      >
        <div className="absolute inset-px rounded-[43px] bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-4 mb-4">
          <Shield className="h-6 w-6 text-orange-400 opacity-60" />
          <h4 className="font-black text-orange-400 uppercase tracking-[0.2em] text-[10px]">Security Audit</h4>
        </div>
        <p className="text-[12px] text-white/40 leading-relaxed font-medium">
          Privachat utilizes locally generated entropy for all key exchanges. No unencrypted metadata is stored on the mesh server.
        </p>
      </motion.div>
    </div>
  );
}
