import React, { useState } from 'react';
import { User as FirebaseUser, updateProfile } from 'firebase/auth';
import { LogOut, Settings, Shield, Bell, HelpCircle, ChevronRight, User, CreditCard, Camera, ArrowLeft, Save, Moon, Palette, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  user: FirebaseUser | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const Profile: React.FC<Props> = ({ user, onLogin, onLogout }) => {
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateName = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateProfile(user, { displayName: newName });
      alert("Name updated successfully!");
      setActiveSub(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const menuItems = [
    { id: 'personal', icon: User, label: 'Personal Information', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'security', icon: Shield, label: 'Security & Privacy', color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'notifications', icon: Bell, label: 'Notifications', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { id: 'payment', icon: CreditCard, label: 'Payment Methods', color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'settings', icon: Settings, label: 'App Settings', color: 'text-gray-600', bg: 'bg-gray-50' },
    { id: 'help', icon: HelpCircle, label: 'Help & Support', color: 'text-red-600', bg: 'bg-red-50' },
  ];

  if (!user) {
    return (
      <div className="px-6 py-20 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <User className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Profile</h2>
        <p className="text-sm text-gray-500 mb-8">Login to manage your services, settings and saved items.</p>
        <button 
          onClick={onLogin}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100"
        >
          Login with Google
        </button>
      </div>
    );
  }

  const renderSubContent = () => {
    switch (activeSub) {
      case 'personal':
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <img src={user.photoURL || ''} className="w-24 h-24 rounded-full border-4 border-white shadow-lg" referrerPolicy="no-referrer" />
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center text-white">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Full Name</label>
              <input 
                type="text" 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email (Gmail)</label>
              <div className="w-full mt-1 px-4 py-3 bg-gray-100 rounded-2xl text-gray-500 text-sm">
                {user.email}
              </div>
            </div>
            <button 
              onClick={handleUpdateName}
              disabled={isUpdating}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" /> {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">Change Password</h4>
                <p className="text-xs text-gray-500">Last changed 3 months ago</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">Two-Factor Auth</h4>
                <p className="text-xs text-gray-500">Enhance your security</p>
              </div>
              <div className="w-10 h-5 bg-gray-200 rounded-full relative">
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-4">
            {['Push Notifications', 'Email Alerts', 'Service Updates'].map(n => (
              <div key={n} className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold">{n}</span>
                <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'payment':
        return (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl text-white">
              <p className="text-xs opacity-80 mb-1">Total Spent</p>
              <h3 className="text-2xl font-bold">Rs. 4,500</h3>
            </div>
            <h4 className="text-sm font-bold px-2">Recent Transactions</h4>
            {[1, 2].map(i => (
              <div key={i} className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-bold">Plumbing Service</h5>
                  <p className="text-xs text-gray-500">April 5, 2026</p>
                </div>
                <span className="text-sm font-bold text-red-500">-Rs. 1,200</span>
              </div>
            ))}
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-bold">Dark Mode</span>
              </div>
              <div className="w-10 h-5 bg-gray-200 rounded-full relative">
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-bold">App Theme Color</span>
              </div>
              <div className="flex gap-2">
                <div className="w-5 h-5 bg-blue-600 rounded-full"></div>
                <div className="w-5 h-5 bg-green-600 rounded-full"></div>
                <div className="w-5 h-5 bg-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="space-y-4">
            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 text-center">
              <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-6">Our support team is available 24/7 to help you with any issues.</p>
              <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold">Contact Support</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="px-6 py-8">
      <AnimatePresence mode="wait">
        {activeSub ? (
          <motion.div
            key="sub"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setActiveSub(null)} className="p-2 bg-gray-100 rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold">{menuItems.find(i => i.id === activeSub)?.label}</h2>
            </div>
            {renderSubContent()}
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex flex-col items-center mb-10">
              <div className="relative">
                <img 
                  src={user.photoURL || ''} 
                  alt={user.displayName || ''} 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-xl"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center">
                  <Settings className="w-3 h-3 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-4">{user.displayName}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            <div className="space-y-3">
              {menuItems.map((item, index) => (
                <motion.button
                  key={index}
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveSub(item.id)}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </motion.button>
              ))}
            </div>

            <button 
              onClick={onLogout}
              className="w-full mt-8 flex items-center justify-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl font-bold border border-red-100"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
