'use client';

import React, { useMemo } from 'react';
import { useStore, type CartItem as CartItemType } from '@/store';
import { AnimatePresence } from 'framer-motion';

import { Bounded } from '@/components/common/Bounded';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { CartItem } from '@/components/cart/CartItem';
import { OrderSummary } from '@/components/cart/OrderSummary';

const CartPage = () => {
    // Select state and actions from the Zustand store
    const cart = useStore((state) => state.cart);
    const { removeFromCart, updateQuantity } = useStore((state) => state.actions);

    // Calculate subtotal, memoized for performance.
    // This calculation runs only when the cart's contents change.
    const subtotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + item?.sale_price! * item.quantity, 0);
    }, [cart]);

    return (
        <Bounded className="py-16 md:py-24">
            <div className="max-w-7xl mx-auto">
                {cart.length > 0 ? (
                    <>
                        <div className="text-center mb-12">
                            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                                My Shopping Cart
                            </h1>
                            <p className="mt-3 text-muted-foreground">
                                Review your items and proceed to a secure checkout.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
                            {/* Cart Items List */}
                            <div className="lg:col-span-2 bg-card border border-border rounded-lg">
                                <AnimatePresence>
                                    {cart.map((item: CartItemType) => (
                                        <CartItem
                                            key={item.id}
                                            item={item}
                                            onRemove={removeFromCart}
                                            onUpdateQuantity={updateQuantity}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <OrderSummary subtotal={subtotal} />
                            </div>
                        </div>
                    </>
                ) : (
                    <EmptyCart />
                )}
            </div>
        </Bounded>
    );
};

export default CartPage;