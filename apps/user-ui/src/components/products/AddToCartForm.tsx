'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import useUser from '@/hooks/useUser';
import useLocationTracking from '@/hooks/useLocationTracking';
import useDeviceTracking from '@/hooks/useDeviceTracking';
import { ArtProduct } from '@/types/products';
import { ShoppingCart, Check } from 'lucide-react';

type AddToCartFormProps = { 
  product: ArtProduct;
  isInCart: boolean;
};

export const AddToCartForm: React.FC<AddToCartFormProps> = ({ product, isInCart }) => {
  const [quantity, setQuantity] = useState(1);
  const stock = product.stock;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock < 10;

  // Store hooks
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const { addToCart, updateQuantity } = useStore((state) => state.actions);
  const cartItems = useStore((state) => state.cart);

  const handleQuantityChange = (amount: number) => setQuantity(prev => {
    const newQuantity = Math.max(1, Math.min(stock, prev + amount));
    return newQuantity;
  });
  
  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault();
    
    if (isInCart) {
      // Update quantity if already in cart
      const cartItem = cartItems.find(item => item.id === product.id);
      if (cartItem) {
        updateQuantity(product.id, cartItem.quantity + quantity);
      }
    } else {
      // Add new item to cart
      if (!isOutOfStock && stock > 0) {
        addToCart(
          { 
            ...product, 
            quantity: quantity,
            sale_price: product.current_price ?? product.sale_price ?? product.regular_price
          } as any, 
          user, 
          location, 
          deviceInfo
        );
      }
    }
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
            <div className="flex items-center gap-3 border border-neutral-700 rounded-full px-3">
                <button 
                  type="button" 
                  onClick={() => handleQuantityChange(-1)} 
                  disabled={quantity <= 1 || isOutOfStock} 
                  className="p-2 disabled:opacity-30 hover:text-accent transition-colors"
                >
                  &minus;
                </button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button 
                  type="button" 
                  onClick={() => handleQuantityChange(1)} 
                  disabled={quantity >= stock || isOutOfStock} 
                  className="p-2 disabled:opacity-30 hover:text-accent transition-colors"
                >
                  +
                </button>
            </div>
        </div>
        <div className="flex flex-col gap-4">
            <button 
              type="submit" 
              className="w-full uppercase py-3.5 bg-accent text-primary rounded-full font-semibold hover:bg-accent/90 transition-all disabled:bg-neutral-600 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
              disabled={isOutOfStock}
            >
                {isInCart ? (
                  <>
                    <Check className="h-5 w-5" />
                    Update Cart ({quantity} more)
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                  </>
                )}
            </button>
            <div className="text-center"><StockStatus /></div>
            
            {isInCart && (
              <p className="text-sm text-center text-green-600 dark:text-green-400 font-medium">
                ✓ Already in your cart. Click to add {quantity} more.
              </p>
            )}
        </div>
    </form>
  );
};