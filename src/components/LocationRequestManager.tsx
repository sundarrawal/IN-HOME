import React, { useState, useEffect } from 'react';
import { MapPin, Check, X, Send } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

interface Request {
  id: string;
  fromUid: string;
  toUid: string;
  status: 'pending' | 'accepted' | 'rejected';
  fromName: string;
}

export const LocationRequestManager: React.FC<{ providerUid: string; providerName: string }> = ({ providerUid, providerName }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Listen for requests sent TO the current user (if they are a provider)
    const q = query(
      collection(db, 'locationRequests'),
      where('toUid', '==', auth.currentUser.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request));
      setRequests(reqs);
    });

    return () => unsubscribe();
  }, []);

  const sendRequest = async () => {
    if (!auth.currentUser) {
      alert("Please login to request location");
      return;
    }
    setIsSending(true);
    try {
      await addDoc(collection(db, 'locationRequests'), {
        fromUid: auth.currentUser.uid,
        fromName: auth.currentUser.displayName || 'Customer',
        toUid: providerUid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert("Location request sent!");
    } catch (error) {
      console.error("Error sending request", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'locationRequests', requestId), { status });
    } catch (error) {
      console.error("Error updating request", error);
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={sendRequest}
        disabled={isSending}
        className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <Send className="w-3 h-3" />
        {isSending ? 'Sending...' : 'Request Location'}
      </button>

      <AnimatePresence>
        {requests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 left-6 right-6 bg-white rounded-2xl shadow-2xl border border-blue-100 p-4 z-50"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Location Request</h4>
                <p className="text-xs text-gray-500">{requests[0].fromName} wants to see your location</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleResponse(requests[0].id, 'accepted')}
                className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Accept
              </button>
              <button
                onClick={() => handleResponse(requests[0].id, 'rejected')}
                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Decline
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
