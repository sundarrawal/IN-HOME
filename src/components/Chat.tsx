import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp, getDocs } from 'firebase/firestore';
import { Send, User as UserIcon, ArrowLeft, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: any;
}

interface ChatUser {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
}

export const Chat: React.FC = () => {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    // In a real app, we'd have a 'users' collection. 
    // For this demo, we'll fetch users from the 'providers' collection to find people to chat with,
    // or we can try to fetch from a 'users' collection if we implement user saving on login.
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'), where('uid', '!=', auth.currentUser?.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userList = snapshot.docs.map(doc => doc.data() as ChatUser);
        setUsers(userList);
      });
      return unsubscribe;
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser || !auth.currentUser) return;

    const q = query(
      collection(db, 'messages'),
      where('senderId', 'in', [auth.currentUser.uid, selectedUser.uid]),
      where('receiverId', 'in', [auth.currentUser.uid, selectedUser.uid]),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Message))
        // Client-side filtering because 'in' query doesn't perfectly handle bidirectional chat without complex indexing
        .filter(m => 
          (m.senderId === auth.currentUser?.uid && m.receiverId === selectedUser.uid) ||
          (m.senderId === selectedUser.uid && m.receiverId === auth.currentUser?.uid)
        );
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'messages'), {
        senderId: auth.currentUser.uid,
        receiverId: selectedUser.uid,
        text: newMessage,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  if (!auth.currentUser) {
    return (
      <div className="px-6 py-20 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <MessageCircle className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Login to Chat</h2>
        <p className="text-sm text-gray-500">You need to be logged in to message service providers.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col">
      <AnimatePresence mode="wait">
        {!selectedUser ? (
          <motion.div 
            key="user-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 overflow-y-auto px-6 py-4"
          >
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Messages</h2>
            {users.length > 0 ? (
              <div className="space-y-4">
                {users.map(user => (
                  <button
                    key={user.uid}
                    onClick={() => setSelectedUser(user)}
                    className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-blue-50 transition-colors"
                  >
                    <img src={user.photoURL} alt={user.displayName} className="w-12 h-12 rounded-full" referrerPolicy="no-referrer" />
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900">{user.displayName}</h4>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <p>No users found to chat with.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="chat-window"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center gap-4">
              <button onClick={() => setSelectedUser(null)} className="p-2 bg-gray-50 rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <img src={selectedUser.photoURL} alt={selectedUser.displayName} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                <h4 className="font-bold text-gray-900">{selectedUser.displayName}</h4>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === auth.currentUser?.uid;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                      isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="px-6 py-4 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
              <button 
                type="submit"
                className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
