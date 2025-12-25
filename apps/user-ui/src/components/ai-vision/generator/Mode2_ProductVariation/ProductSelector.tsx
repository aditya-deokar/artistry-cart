'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Product {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    category: string;
    material: string;
    artisan: string;
}

// Mock database products for demonstration
const mockProducts: Product[] = [
    {
        id: 'p1',
        name: 'Abstract Marble Sculpture',
        imageUrl: '/mock/sculpture.jpg',
        price: 350,
        category: 'Art',
        material: 'Marble',
        artisan: 'Studio Stone',
    },
    {
        id: 'p2',
        name: 'Walnut Coffee Table',
        imageUrl: '/mock/table.jpg',
        price: 850,
        category: 'Furniture',
        material: 'Walnut Wood',
        artisan: 'Woodcraft Co.',
    },
    {
        id: 'p3',
        name: 'Silver Moon Ring',
        imageUrl: '/mock/ring.jpg',
        price: 120,
        category: 'Jewelry',
        material: 'Silver',
        artisan: 'Luna Designs',
    },
];

interface ProductSelectorProps {
    searchQuery: string;
    onSelect: (product: Product) => void;
    selected: Product | null;
}

export function ProductSelector({ searchQuery, onSelect, selected }: ProductSelectorProps) {
    // Filter products based on search (simulated)
    const filtered = mockProducts.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filtered.length === 0) {
        return (
            <div className="text-center py-8 text-[var(--av-silver)]">
                No products found. Try "Table", "Ring", or "Art".
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {filtered.map((product) => (
                <div
                    key={product.id}
                    onClick={() => onSelect(product)}
                    className={cn(
                        'relative cursor-pointer rounded-lg p-3 border-2 transition-all group',
                        selected?.id === product.id
                            ? 'border-[var(--av-gold)] bg-[var(--av-gold)]/5'
                            : 'border-[var(--av-silver)]/10 hover:border-[var(--av-gold)]/50 bg-[var(--av-onyx)]'
                    )}
                >
                    {/* Selected Badge */}
                    {selected?.id === product.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--av-gold)] rounded-full flex items-center justify-center z-10">
                            <Check size={14} className="text-[var(--av-obsidian)]" />
                        </div>
                    )}

                    {/* Product Info */}
                    <div className="flex items-center gap-3">
                        {/* Fallback image */}
                        <div className="w-16 h-16 bg-[var(--av-slate)] rounded-md flex items-center justify-center text-xs text-[var(--av-ash)]">
                            IMG
                        </div>

                        <div>
                            <h4 className="font-semibold text-[var(--av-pearl)] text-sm">{product.name}</h4>
                            <p className="text-xs text-[var(--av-silver)]">{product.artisan}</p>
                            <p className="text-xs font-mono text-[var(--av-gold)] mt-1">${product.price}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
