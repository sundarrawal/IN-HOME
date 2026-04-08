import React from 'react';
import { Bookmark, Heart, ArrowRight } from 'lucide-react';
import { ServiceProvider } from '../types';
import { ServiceProviderCard } from './ServiceProviderCard';

interface Props {
  savedProviders: ServiceProvider[];
  onToggleSave: (id: string) => void;
}

export const Saved: React.FC<Props> = ({ savedProviders, onToggleSave }) => {
  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Saved</h2>
          <p className="text-sm text-gray-500">Your favorite service providers</p>
        </div>
        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
          <Heart className="w-6 h-6 fill-red-500" />
        </div>
      </div>

      {savedProviders.length > 0 ? (
        <div className="space-y-4">
          {savedProviders.map((provider) => (
            <ServiceProviderCard 
              key={`saved-${provider.id}`} 
              provider={provider} 
              isSaved={true}
              onToggleSave={() => onToggleSave(provider.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Bookmark className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No saved items</h3>
          <p className="text-sm text-gray-500 mb-8">Save your favorite providers to find them easily later.</p>
          <button className="flex items-center gap-2 text-blue-600 font-bold">
            Explore Services <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
