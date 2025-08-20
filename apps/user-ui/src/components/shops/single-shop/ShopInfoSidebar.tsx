import React from 'react';
import { MapPin, Clock, Globe } from 'lucide-react';
import Link from 'next/link';

interface ShopData {
  name: string;
  bio: string | null;
  address: string;
  opening_hours: string | null;
  website: string | null;
}

const InfoRow: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-accent mt-1">{icon}</div>
        <div className="text-sm text-primary/80">{children}</div>
    </div>
);

export const ShopInfoSidebar: React.FC<{ shop: ShopData }> = ({ shop }) => {
  return (
    <aside className="lg:col-span-1 p-6 border border-border rounded-lg bg-background/50 space-y-6 lg:sticky top-24">
      <h3 className="font-display text-xl">About {shop.name}</h3>
      <p className="text-primary/80 text-sm leading-relaxed">
        {shop.bio || "This artist has not provided a biography yet."}
      </p>
      <div className="space-y-4 pt-4 border-t border-border">
        <InfoRow icon={<MapPin size={18} />}>{shop.address}</InfoRow>
        {shop.opening_hours && <InfoRow icon={<Clock size={18} />}>{shop.opening_hours}</InfoRow>}
        {shop.website && (
            <InfoRow icon={<Globe size={18} />}>
                <Link href={shop.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary/90 hover:underline break-all">
                    Visit Website
                </Link>
            </InfoRow>
        )}
      </div>
    </aside>
  );
};