'use client';

import React from 'react';
import { Filter } from 'lucide-react';

type ShopFilterProps = {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
};

export const ShopFilter: React.FC<ShopFilterProps> = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="p-6 border border-border rounded-lg bg-background/50 sticky top-24">
      <h3 className="flex items-center gap-2 font-display text-xl mb-4">
        <Filter size={22} /> Shop Categories
      </h3>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => onCategoryChange('all')}
            className={`w-full text-left text-primary/80 hover:text-primary/20 transition-colors ${activeCategory === 'all' ? 'text-accent font-semibold' : ''}`}
          >
            All Shops
          </button>
        </li>
        {categories.map((cat) => (
          <li key={cat}>
            <button
              onClick={() => onCategoryChange(cat)}
              className={`w-full text-left capitalize text-primary/80 hover:text-primary/50 transition-colors ${activeCategory === cat ? 'text-accent font-semibold' : ''}`}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};