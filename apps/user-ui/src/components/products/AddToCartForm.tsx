'use client';

import { useState } from 'react';

type AddToCartFormProps = { stock: number; };

export const AddToCartForm: React.FC<AddToCartFormProps> = ({ stock }) => {
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock < 10;

  const handleQuantityChange = (amount: number) => setQuantity(prev => {
    const newQuantity = Math.max(1, Math.min(stock, prev + amount));
    return newQuantity;
  });
  
  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    console.log(`Added ${quantity} item(s) to cart.`);
     
};

  const StockStatus = () => {
    if (isOutOfStock) return <span className="text-sm font-medium text-red-500">Out of Stock</span>;
    if (isLowStock) return <span className="text-sm font-medium text-yellow-500">Low Stock ({stock} left)</span>;
    return <span className="text-sm font-medium text-green-500">In Stock</span>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
            <span className="font-medium">Quantity</span>
            <div className="flex items-center gap-3 border border-neutral-700 rounded-full">
                <button type="button" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1 || isOutOfStock} className="p-2 disabled:opacity-30">&minus;</button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button type="button" onClick={() => handleQuantityChange(1)} disabled={quantity >= stock || isOutOfStock} className="p-2 disabled:opacity-30">+</button>
            </div>
        </div>
        <div className="flex flex-col gap-4">
            <button type="submit" className="w-full uppercase py-3.5 bg-accent text-white rounded-full font-semibold hover:bg-accent/90 disabled:bg-neutral-600" disabled={isOutOfStock}>
                {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
            <div className="text-center"><StockStatus /></div>
        </div>
    </form>
  );
};