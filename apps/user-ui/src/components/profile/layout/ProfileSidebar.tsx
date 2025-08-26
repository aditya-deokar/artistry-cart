import React from 'react';
import Image from 'next/image';
import { ProfileNavLink } from './ProfileNavLink';
import { User, ShoppingBag, MapPin, Shield, Store, LogOut } from 'lucide-react';

// Define the shape of the user data this component needs
interface UserData {
  name: string;
  avatar?: { url: string } | null;
  role?: string;
}

export const ProfileSidebar: React.FC<{ user: UserData }> = ({ user }) => {

  const navLinks = [
    { href: '/profile', label: 'My Profile', icon: <User size={20} /> },
    { href: '/profile/orders', label: 'Order History', icon: <ShoppingBag size={20} /> },
    { href: '/profile/addresses', label: 'Address Book', icon: <MapPin size={20} /> },
    { href: '/profile/security', label: 'Security', icon: <Shield size={20} /> },
  ];

  return (
    <div className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-lg lg:sticky top-24">
      <div className="flex items-center gap-4 pb-4 border-b border-neutral-800">
        <div className="relative w-16 h-16 rounded-full bg-neutral-800">
          {user.avatar?.url && (
            <Image src={user.avatar.url} alt={user.name} fill className="rounded-full object-cover" />
          )}
        </div>
        <div>
          <h2 className="font-semibold text-xl">{user.name}</h2>
        </div>
      </div>
      
      <nav className="mt-6 space-y-2">
        {navLinks.map(link => (
          <ProfileNavLink key={link.href} href={link.href} icon={link.icon}>
            {link.label}
          </ProfileNavLink>
        ))}

        {/* Conditional link for sellers */}
        {user.role === 'SELLER' && (
            <ProfileNavLink href="/seller/dashboard" icon={<Store size={20} />}>
                Seller Dashboard
            </ProfileNavLink>
        )}
      </nav>

      <div className="mt-6 pt-4 border-t border-neutral-800">
        <button className="flex items-center gap-3 w-full p-3 rounded-md text-red-500 font-semibold hover:bg-red-500/10 transition-colors">
            <LogOut size={20} />
            Logout
        </button>
      </div>
    </div>
  );
};