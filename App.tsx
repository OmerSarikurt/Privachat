/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { BackgroundBlobs } from './components/GlassUI';
import { IPhoneFrame } from './components/IPhoneFrame';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { MessageSquare, Users, Settings, Shield } from 'lucide-react';
import { notificationService } from './lib/notifications';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { PrivacyView } from './components/PrivacyView';
import { ConnectionsView } from './components/ConnectionsView';
import { OnboardingScreen } from './components/OnboardingScreen';
import { Share } from 'lucide-react';

function StandalonePrompt() {
  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-8 text-center overflow-hidden">
      <BackgroundBlobs />
      <div className="relative z-10 w-full max-w-sm">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="w-24 h-24 bg-gradient-to-tr from-orange-500 via-orange-400 to-purple-600 rounded-[36px] flex items-center justify-center shadow-[0_20px_50px_rgba(249,115,22,0.3)] mx-auto mb-10 overflow-hidden relative group"
        >
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50"
           />
           <span className="font-black text-4xl text-white relative z-10 select-none">P</span>
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-extrabold text-white mb-4 tracking-tighter"
        >
          INITIALIZE NODE
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/40 text-[13px] text-balance leading-relaxed mb-12 uppercase font-black tracking-widest px-4"
        >
          Secured infrastructure requires <span className="text-orange-500">Standalone Mode</span> to operate keys.
        </motion.p>
        
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 text-left bg-white/5 border border-white/10 rounded-[44px] p-8 backdrop-blur-3xl relative overflow-hidden"
        >
           <div className="absolute inset-px rounded-[43px] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
           
           <div className="flex items-center gap-5 relative z-10 transition-all hover:translate-x-1">
              <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                 <span className="text-xs font-black text-white/40 font-mono">01</span>
              </div>
              <p className="text-sm text-white/70 font-medium">Tap <span className="inline-flex items-center align-middle bg-white/10 p-1.5 rounded-xl mx-1"><Share className="h-4 w-4 text-orange-400" /></span> in Safari.</p>
           </div>
           
           <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

           <div className="flex items-center gap-5 relative z-10 transition-all hover:translate-x-1">
              <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                 <span className="text-xs font-black text-white/40 font-mono">02</span>
              </div>
              <p className="text-sm text-white/70 font-medium">Select <span className="text-white font-bold">Add to Home Screen</span>.</p>
           </div>

           <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

           <div className="flex items-center gap-5 relative z-10 transition-all hover:translate-x-1">
              <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                 <span className="text-xs font-black text-white/40 font-mono">03</span>
              </div>
              <p className="text-sm text-white/70 font-medium">Launch <span className="text-orange-500 font-bold italic tracking-tight">Privachat</span>.</p>
           </div>
        </motion.div>
      </div>
    </div>
  );
}

function Navigation({ activeTab, onTabChange }: { activeTab: string, onTabChange: (t: string) => void }) {
  return (
    <div className="absolute bottom-0 inset-x-0 h-24 border-t border-white/5 bg-black/40 backdrop-blur-3xl px-10 flex items-center justify-between z-40 pb-4">
      {[
        { id: 'chats', icon: MessageSquare, label: 'Mesh' },
        { id: 'connections', icon: Users, label: 'Nodes' },
        { id: 'privacy', icon: Shield, label: 'Safety' },
        { id: 'settings', icon: Settings, label: 'Config', disabled: true }
      ].map((tab) => (
        <button 
          key={tab.id}
          disabled={tab.disabled}
          onClick={() => onTabChange(tab.id)} 
          className={cn(
            "flex flex-col items-center gap-1.5 transition-all relative group",
            activeTab === tab.id ? "text-orange-500" : "text-white/20 hover:text-white/40",
            tab.disabled && "opacity-30 cursor-not-allowed"
          )}
        >
          {activeTab === tab.id && (
            <motion.div 
               layoutId="nav-active"
               className="absolute -top-12 h-1 w-12 bg-orange-500 rounded-full blur-[2px]"
            />
          )}
          <tab.icon className={cn("h-6 w-6 transition-transform", activeTab === tab.id && "scale-110")} />
          <span className="text-[9px] uppercase font-black tracking-widest">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

function ChatApp() {
  const { user, loading: authLoading } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('chats');
  const [isFocused, setIsFocused] = useState(true);
  const [isStandalone, setIsStandalone] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Privacy Protection: Blur on unfocused
  useEffect(() => {
    // Check for standalone mode (PWA)
    const checkStandalone = () => {
      const isDev = window.location.hostname.includes('ais-dev') || 
                   window.location.hostname.includes('ais-pre') ||
                   window.location.hostname.includes('localhost');
      
      const standalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
      
      if (!isDev) {
        setIsStandalone(standalone);
      } else {
        setIsStandalone(true);
      }
    };

    checkStandalone();
    
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', () => {
      setIsFocused(document.visibilityState === 'visible');
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Check user profile for onboarding
  useEffect(() => {
    async function checkProfile() {
      if (!user) {
        setProfileLoading(false);
        return;
      }
      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (!docSnap.exists() || !docSnap.data().setupComplete) {
          setNeedsOnboarding(true);
        }
      } catch (e) {
        console.error("Error checking profile", e);
      } finally {
        setProfileLoading(false);
      }
    }
    checkProfile();
  }, [user]);

  // Request notifications on mount
  useEffect(() => {
    if (user && !needsOnboarding) {
      notificationService.requestPermission();
    }
  }, [user, needsOnboarding]);

  // Global listener for new messages in all chats
  useEffect(() => {
    if (!user || needsOnboarding) return;

    const q = query(
      collection(db, 'chats'),
      where('members', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const chatData = change.doc.data();
          const lastMsg = chatData.lastMessage;
          
          // Only notify if:
          // 1. It's a new message (we check timestamp or just assume update means new)
          // 2. We are not the sender
          // 3. We are not currently viewing this specific chat
          if (
            lastMsg && 
            lastMsg.senderId !== user.uid && 
            selectedChatId !== change.doc.id
          ) {
            notificationService.notifyNewMessage(
              change.doc.id, 
              lastMsg.text, 
              'Secure Node'
            );
          }
        }
      });
    }, (error) => {
      console.error("Global notification listener error", error);
    });

    return () => unsubscribe();
  }, [user, selectedChatId]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-orange-500 border-t-transparent"
        />
      </div>
    );
  }

  if (!isStandalone) {
    return <StandalonePrompt />;
  }

  if (!user) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center">
        <BackgroundBlobs />
        <AuthScreen />
      </div>
    );
  }

  const InnerContent = (
    <div className="h-full w-full relative flex flex-col bg-black">
      {needsOnboarding ? (
        <OnboardingScreen onComplete={() => setNeedsOnboarding(false)} />
      ) : (
        <AnimatePresence mode="wait">
          {selectedChatId ? (
            <motion.div
              key="chat"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-50 bg-black"
            >
              <ChatWindow 
                chatId={selectedChatId} 
                onBack={() => setSelectedChatId(null)} 
              />
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 overflow-hidden"
            >
              {activeTab === 'chats' ? (
                <ChatList onSelectChat={setSelectedChatId} />
              ) : activeTab === 'connections' ? (
                <ConnectionsView onSelectChat={(id) => {
                  setSelectedChatId(id);
                  setActiveTab('chats');
                }} />
              ) : (
                <PrivacyView />
              )}
              <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center p-4 select-none">
      <BackgroundBlobs />
      
      {/* Privacy Guard Backdrop */}
      <AnimatePresence>
        {!isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] backdrop-blur-[50px] bg-black/60 flex items-center justify-center"
          >
            <div className="text-center">
               <Shield className="h-16 w-16 text-orange-500 mx-auto mb-4 opacity-50" />
               <h2 className="text-white/40 font-black uppercase tracking-[0.3em] text-xs">Node Locked</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Show iPhone frame on desktop, full screen on mobile */}
      <div className={cn("hidden lg:block transition-all duration-500", !isFocused && "scale-[0.98] blur-xl")}>
        <IPhoneFrame>{InnerContent}</IPhoneFrame>
      </div>
      
      <div className={cn("lg:hidden w-full h-[100dvh] fixed inset-0 transition-all duration-500", !isFocused && "blur-2xl")}>
        {InnerContent}
      </div>
    </div>
  );
}

// Main App export
export default function App() {
  return (
    <AuthProvider>
      <ChatApp />
    </AuthProvider>
  );
}

