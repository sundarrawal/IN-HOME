import React from 'react';
import { Star, Phone, MapPin, Heart } from 'lucide-react';
import { ServiceProvider } from '../types';
import { motion } from 'motion/react';
import { LocationRequestManager } from './LocationRequestManager';

interface Props {
  provider: ServiceProvider;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export const ServiceProviderCard: React.FC<Props> = ({ provider, isSaved, onToggleSave }) => {
  const handleCall = () => {
    window.location.href = `tel:${provider.phone}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-4 flex gap-4 relative"
    >
      <div className="relative w-24 h-24 flex-shrink-0">
        <img
          src={provider.image}
          alt={provider.name}
          className="w-full h-full object-cover rounded-2xl"
          referrerPolicy="no-referrer"
        />
        {provider.isFeatured && (
          <div className="absolute -top-2 -left-2 bg-yellow-400 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
            FEATURED
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              {provider.category}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-gray-900">{provider.rating}</span>
            </div>
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
            {provider.name}
          </h4>
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="w-3 h-3" />
            <span className="text-[11px] font-medium">{provider.location}</span>
          </div>
          
          {/* Location Request Button */}
          <LocationRequestManager providerUid={provider.id} providerName={provider.name} />
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-bold text-gray-900">{provider.phone}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSave}
              className={`p-2 rounded-xl transition-colors border ${
                isSaved ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-400 border-gray-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500' : ''}`} />
            </button>
            <button
              onClick={handleCall}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors shadow-md shadow-blue-100"
            >
              <Phone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
