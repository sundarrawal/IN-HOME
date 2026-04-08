import React from 'react';
import * as Icons from 'lucide-react';
import { CATEGORIES } from '../data';

interface Props {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const CategoryList: React.FC<Props> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Categories</h3>
        <button 
          onClick={() => onSelectCategory(null)}
          className="text-sm font-semibold text-blue-600"
        >
          View All
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((category) => {
          const IconComponent = (Icons as any)[category.icon];
          const isActive = selectedCategory === category.name;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(isActive ? null : category.name)}
              className="flex flex-col items-center gap-2 min-w-[72px]"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group ${
                isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}>
                {IconComponent && <IconComponent className="w-6 h-6" />}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
