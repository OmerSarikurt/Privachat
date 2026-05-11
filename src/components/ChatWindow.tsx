import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { encryptMessage, decryptMessage } from '../lib/encryption';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ChevronLeft, Lock, Phone } from 'lucide-react';
import { GlassPanel } from './GlassUI';
import { cn } from '../lib/utils';
import { CallOverlay } from './CallOverlay';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
}

export function ChatWindow({ chatId, onBack }: { chatId: string, onBack: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          text: decryptMessage(data.text, chatId) // Decrypt here
        };
      }) as Message[];
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `chats/${chatId}/messages`);
    });

    return () => unsubscribe();
  }, [chatId]);

  // Auto-deletion timer: 10 seconds after seeing a message
  useEffect(() => {
    const now = Date.now();
    const timers: NodeJS.Timeout[] = [];

    messages.forEach(msg => {
      // If message is new (not just reloaded), start deletion timer
      const timeout = setTimeout(async () => {
        try {
          await deleteDoc(doc(db, 'chats', chatId, 'messages', msg.id));
        } catch (e) {
          console.error("Auto-delete failed", e);
        }
      }, 10000); // 10 seconds
      timers.push(timeout);
    });

    return () => timers.forEach(clearTimeout);
  }, [messages, chatId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const encryptedText = encryptMessage(newMessage, chatId); // Encrypt here

    const messageData = {
      text: encryptedText,
      senderId: user.uid,
      timestamp: serverTimestamp(),
      chatId
    };

    try {
      const draft = newMessage;
      setNewMessage('');
      await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: {
          text: encryptedText,
          senderId: user.uid,
          timestamp: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `chats/${chatId}/messages`);
    }
  };

  return (
    <div className="flex h-full flex-col bg-black/60 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between border-b border-white/5 p-5 backdrop-blur-[40px] bg-black/40 z-20">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack} 
            className="rounded-full p-2 hover:bg-white/5 text-white/50"
          >
            <ChevronLeft className="h-6 w-6" />
          </motion.button>
          
          <div className="h-11 w-11 rounded-[18px] bg-gradient-to-br from-orange-400 via-orange-500 to-purple-600 p-[1px] shadow-lg shadow-orange-500/10">
            <div className="h-full w-full rounded-[17px] bg-[#0a0a0d]/80 backdrop-blur-md flex items-center justify-center" >
              <Lock className="text-white/30 h-4 w-4" />
            </div>
          </div>
          
          <div className="space-y-0.5">
            <h2 className="font-black text-white tracking-tighter text-sm uppercase">Active Node</h2>
            <div className="flex items-center gap-2 leading-none">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
              <p className="text-[9px] uppercase font-black tracking-[0.2em] text-orange-500/60">Tunnel Established</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsCalling(true)}
          className="rounded-full p-2.5 bg-orange-500/10 border border-orange-500/20 text-orange-500 hover:bg-orange-500/20 transition-all active:scale-90"
        >
          <Phone className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {isCalling && (
          <CallOverlay 
            chatId={chatId} 
            onEnd={() => setIsCalling(false)} 
          />
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={cn(
                  "max-w-[85%] rounded-[28px] px-5 py-3.5 shadow-2xl relative group overflow-hidden",
                  msg.senderId === user?.uid 
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold' 
                    : 'bg-white/5 text-white/90 backdrop-blur-3xl border border-white/10'
                )}
              >
                {msg.senderId === user?.uid && (
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                )}
                <p className="text-[13px] leading-relaxed tracking-tight">{msg.text}</p>
                
                {/* Visual indicator for self-destruction */}
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 10, ease: "linear" }}
                  className={cn(
                    "absolute bottom-0 left-0 h-[1.5px]",
                    msg.senderId === user?.uid ? "bg-white/30" : "bg-orange-500/50"
                  )}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={scrollRef} className="h-2" />
      </div>

      <form onSubmit={sendMessage} className="p-6 pt-2 pb-10 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="relative group">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Secure transmission..."
            className="w-full h-16 rounded-[28px] border border-white/5 bg-white/5 pl-7 pr-16 text-[13px] text-white outline-none backdrop-blur-3xl transition-all placeholder:text-white/10 focus:border-orange-500/20 focus:bg-white/10 shadow-inner"
          />
          <motion.button 
            type="submit"
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[22px] bg-orange-500 h-12 w-12 flex items-center justify-center text-white transition-all shadow-[0_10px_20px_rgba(249,115,22,0.3)] border border-orange-400/50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Send className="h-5 w-5 relative z-10" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}
