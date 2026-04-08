import React, { useState, useEffect } from 'react';
import { Plus, Phone, Briefcase, MapPin, CheckCircle2, Check, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ServiceProvider } from '../types';

export const Discover: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [myServices, setMyServices] = useState<ServiceProvider[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Plumbing',
    phone: '',
    location: '',
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(collection(db, 'providers'), where('ownerUid', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceProvider));
      setMyServices(services);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Please login to publish your service");
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'providers', editingId), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'providers'), {
          ...formData,
          ownerUid: auth.currentUser.uid,
          rating: 5.0,
          reviews: 0,
          image: `https://picsum.photos/seed/${formData.category}/400/300`,
          createdAt: serverTimestamp(),
        });
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsFormOpen(false);
        setEditingId(null);
        setFormData({ name: '', category: 'Plumbing', phone: '', location: '' });
      }, 1500);
    } catch (error) {
      console.error("Error publishing service", error);
    }
  };

  const handleEdit = (service: ServiceProvider) => {
    setFormData({
      name: service.name,
      category: service.category,
      phone: service.phone,
      location: service.location,
    });
    setEditingId(service.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteDoc(doc(db, 'providers', id));
      } catch (error) {
        console.error("Error deleting service", error);
      }
    }
  };

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Discover</h2>
          <p className="text-sm text-gray-500">Manage your services</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', category: 'Plumbing', phone: '', location: '' });
            setIsFormOpen(true);
          }}
          className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-white rounded-[32px] p-10 shadow-xl border border-gray-100 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Done!</h3>
            <p className="text-gray-500">Your service has been {editingId ? 'updated' : 'published'} successfully.</p>
          </motion.div>
        ) : isFormOpen ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{editingId ? 'Edit Service' : 'Register Your Service'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-2 bg-gray-50 rounded-xl">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Ram Bahadur"
                  className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Category</label>
                <select 
                  className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option>Plumbing</option>
                  <option>Electrical</option>
                  <option>WiFi Repair</option>
                  <option>Cleaning</option>
                  <option>Painting</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone Number</label>
                <input 
                  required
                  type="tel" 
                  placeholder="98XXXXXXXX"
                  className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Location</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Kathmandu"
                  className="w-full mt-1 px-4 py-3 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100"
                >
                  {editingId ? 'Update' : 'Publish Now'}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {myServices.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">My Published Services</h3>
                <div className="space-y-3">
                  {myServices.map(service => (
                    <div key={service.id} className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{service.name}</h4>
                          <p className="text-[10px] text-gray-500">{service.category} • {service.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(service)} className="p-2 bg-gray-50 text-blue-600 rounded-xl">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(service.id)} className="p-2 bg-gray-50 text-red-500 rounded-xl">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100">
              <Briefcase className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Grow your business</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Join Sajilo Service and get more customers directly on your phone. 
                Register your service for free today!
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-green-500 mb-2" />
                <h4 className="text-sm font-bold">Verified</h4>
                <p className="text-[10px] text-gray-500">Trusted providers</p>
              </div>
              <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <MapPin className="w-6 h-6 text-red-500 mb-2" />
                <h4 className="text-sm font-bold">Nearby</h4>
                <p className="text-[10px] text-gray-500">Local reach</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
