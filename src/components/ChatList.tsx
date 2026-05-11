import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { decryptMessage } from '../lib/encryption';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, MessageSquare } from 'lucide-react';

interface Chat {
  id: string;
  members: string[];
  lastMessage?: {
    text: string;
    timestamp: any;
  };
  updatedAt: any;
}

export function ChatList({ onSelectChat }: { onSelectChat: (id: string) => void }) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('members', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Chat[];
      setChats(chatData.sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chats');
    });

    return () => unsubscribe();
  }, [user]);

  const filteredChats = chats.filter(chat => {
    const query = searchQuery.toLowerCase();
    const lastMsgText = chat.lastMessage?.text ? decryptMessage(chat.lastMessage.text, chat.id).toLowerCase() : '';
    // In a real app we'd search member names, here we search last message
    return lastMsgText.includes(query) || chat.id.toLowerCase().includes(query);
  });

  const createNewChat = async () => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'chats'), {
        members: [user.uid, 'public_broadcast'], 
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onSelectChat(docRef.id);
    } catch (error) {
       handleFirestoreError(error, OperationType.CREATE, 'chats');
    }
  };

  return (
    <div className="flex h-full flex-col bg-black">
      <div className="p-8 pt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Chats</h1>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Secure Mesh</p>
            </div>
          </div>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-purple-600/5 blur-xl rounded-full" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input 
            type="text" 
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="relative w-full rounded-2xl bg-white/5 border border-white/5 py-4 pl-12 pr-4 text-sm text-white outline-none backdrop-blur-xl placeholder:text-white/20 focus:border-orange-500/30 transition-all font-medium"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {loading ? (
          <div className="flex animate-pulse flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-3xl bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredChats.map((chat, idx) => (
                <motion.button
                  key={chat.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onSelectChat(chat.id)}
                  className="group relative flex w-full items-center gap-4 rounded-[32px] p-4 transition-all hover:bg-white/5 active:scale-[0.98] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative h-14 w-14 flex-shrink-0">
                    <div className="h-full w-full rounded-[20px] bg-gradient-to-br from-orange-400 via-orange-500 to-purple-500 p-[1px] shadow-lg shadow-orange-500/10 group-hover:shadow-orange-500/20 transition-all">
                      <div className="flex h-full w-full items-center justify-center rounded-[19px] bg-black/40 backdrop-blur-md">
                        <MessageSquare className="h-6 w-6 text-white/50 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-black bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                  </div>
                  
                  <div className="flex-1 text-left overflow-hidden relative z-10">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className="font-bold text-white/90 truncate mr-2 tracking-tight">Secure Node: {chat.id.substring(0, 8)}</h3>
                      <span className="text-[9px] text-orange-500/80 uppercase font-black tracking-widest bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                        Encrypted
                      </span>
                    </div>
                    <p className="truncate text-[11px] text-white/30 font-medium tracking-tight">
                      {chat.lastMessage?.text ? decryptMessage(chat.lastMessage.text, chat.id) : 'Mesh handshaking...'}
                    </p>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
