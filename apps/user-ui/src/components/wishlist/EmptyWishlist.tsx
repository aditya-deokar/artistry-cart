'use client';

import { HeartCrack } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

export const EmptyWishlist = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 md:py-32 border-2 border-dashed border-border rounded-lg bg-muted/50">
      <HeartCrack className="w-16 h-16 text-muted-foreground" strokeWidth={1} />
      <h2 className="mt-6 font-display text-3xl font-semibold text-foreground">
        Your Wishlist is a Blank Canvas
      </h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Find a piece that inspires you. Your next favorite artwork is just a click away.
      </p>
      <Link href="/shop">
        <Button className="mt-6">Start Exploring</Button>
      </Link>
    </div>
  );
};