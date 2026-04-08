import React from 'react';
import { Search, MapPin, LogIn, LogOut } from 'lucide-react';
import { User } from 'firebase/auth';

interface Props {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
}

export const Header: React.FC<Props> = ({ user, onLogin, onLogout, onSearch }) => {
  return (
    <header className="px-6 pt-8 pb-4 bg-white sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <MapPin className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">
              {user ? `Hello, ${user.displayName?.split(' ')[0]}` : 'Location'}
            </p>
            <h2 className="text-sm font-bold text-gray-900">
              {user ? 'Welcome Back!' : 'Kathmandu, Nepal'}
            </h2>
          </div>
        </div>
        
        {user ? (
          <button 
            onClick={onLogout}
            className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={onLogin}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-100"
          >
            <LogIn className="w-4 h-4" />
            Login
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search for services..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>
    </header>
  );
};
