'use client';

import { useState } from 'react';
import { ArtProduct } from '@/types/products';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ReadMoreDescription } from './ReadMoreDescription';

export const ProductDetailsTabs: React.FC<{ product: ArtProduct }> = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specs', label: 'Specifications', disabled: !product.custom_specifications?.length },
    { id: 'artist', label: 'About The Artist', disabled: !product.Shop },
    { id: 'warranty', label: 'Warranty', disabled: !product.warranty },
  ];

  return (
    <div className="w-full">
      <div className="border-b border-neutral-700" role="tablist">
        <div className="flex gap-8">
          {tabs.map(tab => (
            !tab.disabled && (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} role="tab" aria-selected={activeTab === tab.id} className={cn("py-3 font-medium transition-colors focus:outline-none", activeTab === tab.id ? "text-primary/60 border-b-2 border-accent" : "text-primary/80 hover:text-primary")}>
                {tab.label}
              </button>
            )
          ))}
        </div>
      </div>
      <div className="py-8">
        {activeTab === 'description' && (
          <ReadMoreDescription htmlContent={product.detailed_description} />
        )}
        {activeTab === 'specs' && (
          <div className="space-y-3">
            {product.custom_specifications.map(spec => (
              <div key={spec.name} className="flex justify-between border-b border-neutral-800 pb-2 text-sm">
                <span className="text-primary/70">{spec.name}</span>
                <span className="font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'artist' && product.Shop && (
          <div className="prose prose-invert max-w-none">
            <h3>{product.Shop.name}</h3>
            <p>{product.Shop.bio || 'This artist has not provided a biography yet.'}</p>
            <Link href={`/artist/${product.Shop.id}`} className="text-primary/50 hover:underline not-prose">
              View Artist's Collection &rarr;
            </Link>
          </div>
        )}
        {activeTab === 'warranty' && (
          <div className="prose prose-invert max-w-none">
            <h3>Warranty Information</h3>
            <p>{product.warranty}</p>
          </div>
        )}
      </div>
    </div>
  );
};