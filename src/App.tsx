import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoryList } from './components/CategoryList';
import { ServiceProviderCard } from './components/ServiceProviderCard';
import { BottomNav } from './components/BottomNav';
import { SERVICE_PROVIDERS as MOCK_PROVIDERS } from './data';
import { ServiceProvider } from './types';
import { motion } from 'motion/react';
import { auth, db, signInWithGoogle, logout } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, onSnapshot, orderBy, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Discover } from './components/Discover';
import { Profile } from './components/Profile';
import { Saved } from './components/Saved';
import { Chat } from './components/Chat';

export type Tab = 'home' | 'discover' | 'chat' | 'saved' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbProviders, setDbProviders] = useState<ServiceProvider[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Save user to Firestore for chat discovery
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          email: user.email,
          role: 'customer', // Default role
          lastSeen: serverTimestamp(),
        }, { merge: true });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'providers'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const providers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ServiceProvider));
      setDbProviders(providers);
    });
    return () => unsubscribe();
  }, []);

  const allProviders = [...dbProviders, ...MOCK_PROVIDERS];

  const filteredProviders = allProviders.filter((provider) => {
    const matchesCategory = selectedCategory ? provider.category.toLowerCase() === selectedCategory.toLowerCase() : true;
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          provider.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleSave = (id: string) => {
    setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return <Discover />;
      case 'chat':
        return <Chat />;
      case 'saved':
        return <Saved savedProviders={allProviders.filter(p => savedIds.includes(p.id))} onToggleSave={toggleSave} />;
      case 'profile':
        return <Profile user={user} onLogin={signInWithGoogle} onLogout={logout} />;
      case 'home':
      default:
        return (
          <>
            {/* Special Offer Banner */}
            <div className="px-6 py-4">
              <div className="relative h-40 bg-gradient-to-br from-blue-600 to-blue-400 rounded-[32px] overflow-hidden p-6 flex flex-col justify-center">
                <div className="relative z-10 max-w-[60%]">
                  <h2 className="text-white text-xl font-bold mb-2">Special Offer Up to 40%</h2>
                  <button className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
                    Book Now
                  </button>
                </div>
                <img 
                  src="https://picsum.photos/seed/worker/400/400" 
                  alt="Worker" 
                  className="absolute right-0 bottom-0 h-full object-contain opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <CategoryList 
              selectedCategory={selectedCategory} 
              onSelectCategory={setSelectedCategory} 
            />

            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedCategory ? `${selectedCategory} Services` : 'Popular Services'}
                </h3>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="text-sm font-semibold text-blue-600"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-2">
                {filteredProviders.length > 0 ? (
                  filteredProviders.map((provider) => (
                    <ServiceProviderCard 
                      key={provider.id} 
                      provider={provider} 
                      isSaved={savedIds.includes(provider.id)}
                      onToggleSave={() => toggleSave(provider.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    No services found in this category.
                  </div>
                )}
              </div>
            </div>

            {/* Featured Section (Horizontal) */}
            {!selectedCategory && (
              <div className="px-6 py-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Top Rated</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {allProviders.filter(p => p.rating >= 4.7).map((provider) => (
                    <motion.div 
                      key={`top-${provider.id}`}
                      whileHover={{ scale: 0.98 }}
                      className="min-w-[200px] bg-white rounded-3xl p-3 border border-gray-100 shadow-sm"
                    >
                      <img 
                        src={provider.image} 
                        alt={provider.name} 
                        className="w-full h-32 object-cover rounded-2xl mb-3"
                        referrerPolicy="no-referrer"
                      />
                      <h4 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{provider.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-600">{provider.category}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold">{provider.rating}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {activeTab === 'home' && (
        <Header 
          user={user} 
          onLogin={signInWithGoogle} 
          onLogout={logout} 
          onSearch={setSearchQuery}
        />
      )}
      
      <main>
        {renderContent()}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
