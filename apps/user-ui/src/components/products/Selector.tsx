'use client'

import { useState } from "react";

export const SizeSelector: React.FC<{ sizes: string[] }> = ({ sizes }) => {
    const [selectedSize, setSelectedSize] = useState(sizes[0]);
    return (
        <div>
            <span className="text-sm font-medium">Size: {selectedSize}</span>
            <div className="flex gap-2 mt-2">
                {sizes.map(size => (
                    <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-2 text-sm border rounded-full transition-colors ${selectedSize === size ? 'bg-accent text-white border-accent' : 'border-neutral-700 hover:border-neutral-500'}`}>
                        {size}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const ColorSelector: React.FC<{ colors: string[] }> = ({ colors }) => {
    const [selectedColor, setSelectedColor] = useState(colors[0]);
    return (
        <div>
            <span className="text-sm font-medium">Color</span>
            <div className="flex gap-3 mt-2">
                {colors.map(color => (
                    <button key={color} onClick={() => setSelectedColor(color)} className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color ? 'border-white ring-2 ring-accent' : 'border-transparent'}`} style={{ backgroundColor: color }} aria-label={`Select color ${color}`}></button>
                ))}
            </div>
        </div>
    );
};