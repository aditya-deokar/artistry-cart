import { ArtProduct } from '@/types/products';
import React from 'react';

const TagIcon = () => <svg className="w-4 h-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg>;
const BrandIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const CashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>

export const ProductMeta: React.FC<{ product: ArtProduct }> = ({ product }) => {
  return (
    <div className="space-y-4 pt-4 border-t border-neutral-800">
        {product.brand && (
            <div className="flex items-center gap-3 text-sm">
                <BrandIcon /> <span className="text-primary/70">Brand:</span> <span className="font-medium">{product.brand}</span>
            </div>
        )}
        {product.cash_on_delivery && (
            <div className="flex items-center gap-3 text-sm">
                <CashIcon /> <span className="text-primary/70">Payment:</span> <span className="font-medium">Cash on Delivery Available</span>
            </div>
        )}
        {product.tags && product.tags.length > 0 && (
            <div className="flex items-start gap-3 text-sm">
                <TagIcon /> <span className="text-primary/70 mt-1">Tags:</span>
                <div className="flex flex-wrap gap-2">
                    {product.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-neutral-800 rounded-full text-xs font-medium">
                            {tag.trim()}
                        </span>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};