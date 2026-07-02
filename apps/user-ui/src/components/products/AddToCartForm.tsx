'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import useAnalytics from '@/hooks/useAnalytics';
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
  const { trackEvent } = useAnalytics();
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
        void trackEvent({
          action: 'add_to_cart',
          productId: product.id,
          shopId: product.Shop?.id,
          quantity,
          source: 'user-ui.product-page',
        });
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
        );
        void trackEvent({
          action: 'add_to_cart',
          productId: product.id,
          shopId: product.Shop?.id,
          quantity,
          source: 'user-ui.product-page',
        });
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
        <div className="flex items-center justify-between border-b border-[var(--ac-linen)] dark:border-white/10 pb-4 mb-6">
            <span className="text-[13px] text-[var(--ac-stone)] uppercase tracking-wider">Quantity</span>
            <div className="flex items-center gap-4">
                <button 
                  type="button" 
                  onClick={() => handleQuantityChange(-1)} 
                  disabled={quantity <= 1 || isOutOfStock} 
                  className="p-1 disabled:opacity-30 hover:text-[var(--ac-charcoal)] dark:hover:text-white transition-colors text-[var(--ac-stone)]"
                >
                  &minus;
                </button>
                <span className="w-6 text-center text-sm">{quantity}</span>
                <button 
                  type="button" 
                  onClick={() => handleQuantityChange(1)} 
                  disabled={quantity >= stock || isOutOfStock} 
                  className="p-1 disabled:opacity-30 hover:text-[var(--ac-charcoal)] dark:hover:text-white transition-colors text-[var(--ac-stone)]"
                >
                  +
                </button>
            </div>
        </div>
        <div className="flex flex-col gap-4">
            <button 
              type="submit" 
              className="w-full uppercase py-5 bg-[#181818] dark:bg-white text-white dark:text-[#181818] font-semibold text-[13px] tracking-widest hover:bg-black dark:hover:bg-gray-200 transition-all disabled:bg-neutral-300 disabled:dark:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
              disabled={isOutOfStock}
            >
                {isInCart ? (
                  <>
                    <Check className="h-4 w-4" />
                    UPDATE CART ({quantity} MORE)
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    {isOutOfStock ? 'SOLD OUT' : 'ADD TO CART'}
                  </>
                )}
            </button>
            <div className="text-center mt-2"><StockStatus /></div>
            
            {isInCart && (
              <p className="text-sm text-center text-green-600 dark:text-green-400 font-medium mt-2">
                ✓ Already in your cart. Click to add {quantity} more.
              </p>
            )}
        </div>
    </form>
  );
};
