import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { UserPlus, Key, QrCode, Check, Copy, AlertCircle, Loader2 } from 'lucide-react';

export function ConnectionsView({ onSelectChat }: { onSelectChat: (id: string) => void }) {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Generate a random 6-character code
  const generateCode = async () => {
    if (!user) return;
    setIsGenerating(true);
    setError(null);
    
    try {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      await addDoc(collection(db, 'friendCodes'), {
        code: newCode,
        creatorId: user.uid,
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: serverTimestamp()
      });
      
      setCode(newCode);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'friendCodes');
      setError('Failed to generate code.');
    } finally {
      setIsGenerating(false);
    }
  };

  const redeemCode = async () => {
    if (!user || !inputCode) return;
    setIsRedeeming(true);
    setError(null);
    setSuccess(false);

    try {
      const q = query(
        collection(db, 'friendCodes'), 
        where('code', '==', inputCode.toUpperCase())
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('Invalid or expired code.');
        return;
      }

      const codeDoc = snapshot.docs[0];
      const codeData = codeDoc.data();
      const expiresAt = codeData.expiresAt.toMillis();

      if (Date.now() > expiresAt) {
        setError('This code has expired.');
        await deleteDoc(codeDoc.ref);
        return;
      }

      if (codeData.creatorId === user.uid) {
        setError('You cannot redeem your own code.');
        return;
      }

      // Check if chat already exists
      const chatsQ = query(
        collection(db, 'chats'),
        where('members', 'array-contains', user.uid)
      );
      const chatsSnapshot = await getDocs(chatsQ);
      const existingChat = chatsSnapshot.docs.find(d => d.data().members.includes(codeData.creatorId));

      if (existingChat) {
        onSelectChat(existingChat.id);
        return;
      }

      // Create new chat
      const chatRef = await addDoc(collection(db, 'chats'), {
        members: [user.uid, codeData.creatorId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: {
          text: 'Encrypted connection established.',
          senderId: 'system',
          timestamp: serverTimestamp()
        }
      });

      // Delete the used code
      await deleteDoc(codeDoc.ref);
      
      setSuccess(true);
      setTimeout(() => onSelectChat(chatRef.id), 1500);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'chats');
      setError('Connection failed.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-black p-8 pt-16 overflow-y-auto pb-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
      
      <div className="mb-12 relative z-10">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-1 uppercase">Connect</h1>
        <div className="flex items-center gap-2">
           <div className="w-8 h-0.5 bg-orange-500 rounded-full" />
           <p className="text-white/30 text-[10px] uppercase font-black tracking-widest">Mesh Network Authorization</p>
        </div>
      </div>

      <div className="space-y-8 relative z-10">
        {/* Generate Code Section */}
        <div className="p-8 rounded-[44px] bg-white/5 border border-white/10 backdrop-blur-3xl relative overflow-hidden group">
          <div className="absolute inset-px rounded-[43px] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-8">
             <div className="h-12 w-12 rounded-[18px] bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner">
                <Key className="h-6 w-6 text-orange-500" />
             </div>
             <h3 className="font-black text-white uppercase tracking-[0.2em] text-[11px]">Identity Key</h3>
          </div>
          
          <p className="text-[12px] text-white/40 mb-8 leading-relaxed font-medium">
            Generate a temporal verification token. Valid for <span className="text-orange-500 font-bold">300 seconds</span>.
          </p>

          <AnimatePresence mode="wait">
            {code ? (
              <motion.div 
                key="code"
                initial={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                className="flex flex-col items-center gap-6"
              >
                <div className="text-5xl font-black tracking-[0.3em] text-white bg-black/40 px-10 py-6 rounded-[28px] border border-white/10 shadow-2xl relative">
                  <div className="absolute inset-0 bg-orange-500/5 blur-2xl rounded-full" />
                  <span className="relative z-10">{code}</span>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                  }}
                  className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 hover:text-orange-400 transition-colors bg-orange-500/10 px-4 py-2 rounded-xl"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Secret
                </motion.button>
              </motion.div>
            ) : (
              <motion.button 
                key="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateCode}
                disabled={isGenerating}
                className="w-full h-16 rounded-[24px] bg-orange-500 text-white font-black uppercase tracking-widest text-[13px] transition-all hover:bg-orange-600 shadow-[0_15px_30px_rgba(249,115,22,0.3)] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <QrCode className="h-6 w-6" />}
                Generate Token
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Redeem Code Section */}
        <div className="p-8 rounded-[44px] bg-white/5 border border-white/10 backdrop-blur-3xl relative overflow-hidden group">
          <div className="absolute inset-px rounded-[43px] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-8">
             <div className="h-12 w-12 rounded-[18px] bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-inner">
                <UserPlus className="h-6 w-6 text-purple-500" />
             </div>
             <h3 className="font-black text-white uppercase tracking-[0.2em] text-[11px]">Sync Terminal</h3>
          </div>

          <div className="relative mb-6">
            <input 
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="000-000"
              maxLength={6}
              className="w-full h-18 bg-black/40 border border-white/10 rounded-[28px] text-center text-3xl font-black tracking-[0.4em] text-white placeholder:text-white/5 outline-none focus:border-purple-500/40 transition-all shadow-inner"
            />
            <AnimatePresence>
              {success && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-[0.1em] mb-6"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </motion.div>
          )}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={redeemCode}
            disabled={isRedeeming || inputCode.length !== 6 || success}
            className={cn(
               "w-full h-16 rounded-[24px] font-black uppercase tracking-widest text-[13px] transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed",
               success ? "bg-green-500 text-white" : "bg-white/10 border border-white/10 text-white hover:bg-white/20"
            )}
          >
            {isRedeeming ? <Loader2 className="h-6 w-6 animate-spin" /> : <Check className="h-6 w-6" />}
            {success ? 'Authenticated' : 'Initiate Handshake'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
