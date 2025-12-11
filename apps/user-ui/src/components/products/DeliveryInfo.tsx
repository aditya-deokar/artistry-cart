'use client';

import React from 'react';
import useLocationTracking from '@/hooks/useLocationTracking';
import { ArtProduct } from '@/types/products';
import Link from 'next/link';
import { Banknote, MapPin, ShieldCheck, ShoppingBagIcon, Truck, Undo2 } from 'lucide-react';



const getEstimatedDeliveryDate = () => {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startDate = new Date();
  const endDate = new Date();
  startDate.setDate(startDate.getDate() + 5); // 5 days from now
  endDate.setDate(endDate.getDate() + 7);   // 7 days from now
  return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
};


const InfoItem: React.FC<{ icon: React.ReactNode; title: string; children?: React.ReactNode }> = ({ icon, title, children }) => (
  <li className="flex items-start gap-4">
    <div className="flex-shrink-0 text-accent mt-1">{icon}</div>
    <div>
      <h4 className="font-semibold text-primary">{title}</h4>
      {children && <p className="text-sm text-primary/70">{children}</p>}
    </div>
  </li>
);



type DeliveryInfoProps = {
  product: ArtProduct;
};

export const DeliveryInfo: React.FC<DeliveryInfoProps> = ({ product }) => {
  const { location, loading, error } = useLocationTracking();

  const LocationDisplay = () => {
    if (loading) {
      return <div className="h-5 w-3/4 rounded bg-neutral-700 animate-pulse"></div>;
    }
    if (error || !location) {
      return (
        <span className="font-semibold text-yellow-500">
          Delivery info unavailable
        </span>
      );
    }
    return (
      <span className="font-semibold text-primary">
        Delivering to: {location.city}, {location.postalCode}
      </span>
    );
  };

  return (
    <div className="p-6 border border-neutral-800 rounded-lg bg-backgound/50 space-y-6">
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
        <MapPin />
        <LocationDisplay />
      </div>

      <ul className="space-y-5">
        <InfoItem icon={<Truck />} title="Estimated Delivery">
          {getEstimatedDeliveryDate()}
        </InfoItem>

        <InfoItem icon={<Undo2 />} title="7 Day Return Policy">
          If item is damaged, incorrect, or not as described.
        </InfoItem>

        {product.warranty && (
          <InfoItem icon={<ShieldCheck />} title="Warranty Included">
            {product.warranty}
          </InfoItem>
        )}

        {product.cash_on_delivery && (
          <InfoItem icon={<Banknote />} title="Payment Method">
            Cash on Delivery Available
          </InfoItem>
        )}

        {product.Shop ? (
          <InfoItem icon={<ShoppingBagIcon />} title="Sold By">
            <Link href={`/artist/${product.Shop.id}`} className="hover:text-primary hover:underline transition-colors">
              {product.Shop.name}
            </Link>
          </InfoItem>
        ) : (
          <InfoItem icon={<ShoppingBagIcon />} title="Sold By">
            <span>Unknown Artist</span>
          </InfoItem>
        )}
      </ul>
    </div>
  );
};

