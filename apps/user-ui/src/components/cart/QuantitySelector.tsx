'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '../ui/button';

type QuantitySelectorProps = {
  quantity: number;
  maxStock: number;
  onIncrease: () => void;
  onDecrease: () => void;
};

export const QuantitySelector = ({ quantity, maxStock, onIncrease, onDecrease }: QuantitySelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onDecrease}
        disabled={quantity <= 1}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-10 text-center font-medium">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onIncrease}
        disabled={quantity >= maxStock}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};