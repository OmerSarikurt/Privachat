import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, PhoneOff, Shield, Mic, MicOff, Volume2, Waves, Zap, Ghost, UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface CallOverlayProps {
  chatId: string;
  onEnd: () => void;
}

type ScrambleMode = 'ghost' | 'android' | 'void';

export function CallOverlay({ chatId, onEnd }: CallOverlayProps) {
  const [status, setStatus] = useState<'connecting' | 'secure' | 'ended'>('connecting');
  const [duration, setDuration] = useState(0);
  const [mode, setMode] = useState<ScrambleMode>('ghost');
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Audio Nodes for real-time updates
  const filterRef = useRef<BiquadFilterNode | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'secure') {
      timer = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    const startAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        const ctx = audioContextRef.current;
        const source = ctx.createMediaStreamSource(stream);

        const bufferSize = 4096;
        const bitCrusher = ctx.createScriptProcessor(bufferSize, 1, 1);
        
        bitCrusher.onaudioprocess = (e) => {
          const input = e.inputBuffer.getChannelData(0);
          const output = e.outputBuffer.getChannelData(0);
          const bits = 4;
          const norm = Math.pow(2, bits);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.round(input[i] * norm) / norm;
          }
        };

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filterRef.current = filter;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        source.connect(bitCrusher);
        bitCrusher.connect(filter);
        filter.connect(analyser);

        setStatus('secure');
        drawVisualizer();
      } catch (err) {
        console.error('Failed to access mic:', err);
        onEnd();
      }
    };

    startAudio();

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!filterRef.current) return;
    
    switch (mode) {
      case 'ghost':
        filterRef.current.type = 'highpass';
        filterRef.current.frequency.value = 1200;
        break;
      case 'android':
        filterRef.current.type = 'bandpass';
        filterRef.current.frequency.value = 1000;
        break;
      case 'void':
        filterRef.current.type = 'lowpass';
        filterRef.current.frequency.value = 400;
        break;
    }
  }, [mode]);

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!analyserRef.current) return;
      requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height;
        ctx.fillStyle = `rgba(249, 115, 22, ${0.05 + (barHeight / height) * 0.5})`;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    render();
  };

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-[60px] flex flex-col items-center justify-between p-8 text-white select-none overflow-hidden"
    >
      {/* Background Ambience / Animated Glows */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-orange-500/10 via-transparent to-purple-600/5 pointer-events-none" />
      <motion.div 
        animate={{ 
          opacity: [0.1, 0.2, 0.1],
          scale: [1, 1.1, 1],
          x: [-20, 20, -20] 
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-orange-600/20 rounded-full blur-[100px]"
      />

      <div className="w-full flex justify-between items-center z-10">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10"
        >
           <Shield className="h-4 w-4 text-orange-400" />
           <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Secured Node</span>
        </motion.div>
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-[10px] font-black uppercase tracking-widest text-white/30 font-mono"
        >
          {formatDuration(duration)}
        </motion.div>
      </div>

      <div className="flex flex-col items-center flex-1 justify-center w-full max-w-xs z-10">
        {/* Avatar with Liquid Ring */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-12"
        >
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.05, 1],
              borderRadius: ["60px", "50px", "60px"]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 bg-gradient-to-tr from-orange-500/20 via-orange-500/5 to-purple-600/20 blur-xl opacity-50"
          />
          
          <motion.div 
            animate={{ 
              y: [0, -4, 0],
              scale: [1, 1.02, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-40 h-40 rounded-[50px] bg-white/5 border border-white/10 flex items-center justify-center shadow-inner overflow-hidden"
          >
            {/* Liquid Refraction Overlay */}
            <motion.div 
              animate={{ x: [-200, 200] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
            />
            
            <canvas 
              ref={canvasRef} 
              width={300} 
              height={300} 
              className="absolute inset-0 w-full h-full p-4 opacity-30 blur-[2px] scale-150" 
            />
            
            <div className="relative z-10 flex flex-col items-center">
              <UserCircle className="h-16 w-16 text-white/10" />
              {status === 'secure' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -top-1 -right-1"
                >
                  <div className="w-5 h-5 bg-orange-500 rounded-full border-4 border-black shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                  <motion.div 
                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-orange-500 rounded-full"
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div
           initial={{ y: 10, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.2 }}
           className="text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Encrypted Voice Node</h2>
          <div className="flex items-center justify-center gap-3">
             <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/20" />
             <p className="text-orange-400 text-[10px] font-black uppercase tracking-[0.4em]">
               {status === 'connecting' ? 'SYNCING TUNNEL' : 'MODULATION ACTIVE'}
             </p>
             <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/20" />
          </div>
        </motion.div>

        {/* PROFILE SELECTOR */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full mt-12 bg-white/5 border border-white/10 rounded-[36px] p-5 backdrop-blur-xl relative group shadow-2xl"
        >
          <div className="absolute inset-px rounded-[35px] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-4 text-center">Spectral Profiles</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'ghost', icon: Ghost, label: 'GHOST' },
              { id: 'android', icon: Zap, label: 'ANDROID' },
              { id: 'void', icon: Waves, label: 'VOID' }
            ].map((p, idx) => (
              <motion.button
                key={p.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode(p.id as ScrambleMode)}
                className={cn(
                  "flex flex-col items-center gap-2.5 p-3.5 rounded-2xl border transition-all relative overflow-hidden",
                  mode === p.id 
                    ? "bg-orange-500 border-orange-400 text-white shadow-xl shadow-orange-500/20" 
                    : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                )}
              >
                {mode === p.id && (
                  <motion.div 
                    layoutId="activeMode"
                    className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"
                  />
                )}
                <p.icon className="h-4 w-4 relative z-10" />
                <span className="text-[7px] font-black tracking-[0.2em] relative z-10">
                  {p.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CONTROLS */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-xs pb-10 z-10"
      >
        <div className="flex items-center justify-center gap-8 mb-10">
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.08)" }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 cursor-not-allowed group transition-all"
          >
            <MicOff className="h-5 w-5 group-hover:text-white/40" />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.12, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onEnd}
            className="w-20 h-20 rounded-[30px] bg-red-500 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] border-4 border-black relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <PhoneOff className="h-7 w-7 text-white" />
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.08)" }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 cursor-not-allowed group transition-all"
          >
            <Volume2 className="h-5 w-5 group-hover:text-white/40" />
          </motion.button>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-[8px] text-white/20 uppercase font-black tracking-widest flex items-center justify-center gap-2">
             <span className="w-1 h-1 bg-orange-500 rounded-full animate-ping" />
             Spectral Tunneling Active
          </p>
          <p className="text-[8px] text-white/10 uppercase font-black tracking-widest font-mono">
             UID: {chatId.substring(0, 12)}...
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
