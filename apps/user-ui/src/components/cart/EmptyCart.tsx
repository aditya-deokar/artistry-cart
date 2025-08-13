'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

export const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 md:py-32 border-2 border-dashed border-border rounded-lg bg-muted/50">
      <ShoppingCart className="w-16 h-16 text-muted-foreground" strokeWidth={1} />
      <h2 className="mt-6 font-display text-3xl font-semibold text-foreground">
        Your Cart is Empty
      </h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Looks like you haven't added any artwork to your cart yet. Let's find something beautiful.
      </p>
      <Link href="/shop">
        <Button className="mt-6">Start Shopping</Button>
      </Link>
    </div>
  );
};