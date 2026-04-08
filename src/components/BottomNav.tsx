import React from 'react';
import { Home, Compass, MessageSquare, Bookmark, User } from 'lucide-react';
import { Tab } from '../App';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'discover', icon: Compass, label: 'Discover' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'saved', icon: Bookmark, label: 'Saved' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-20">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        if (tab.id === 'chat') {
          return (
            <div key={tab.id} className="relative -top-6">
              <button 
                onClick={() => onTabChange(tab.id)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isActive ? 'bg-blue-600 text-white shadow-blue-300 scale-110' : 'bg-blue-500 text-white shadow-blue-200'
                }`}
              >
                <Icon className="w-6 h-6" />
              </button>
            </div>
          );
        }

        return (
          <button 
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'fill-blue-50' : ''}`} />
            <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
