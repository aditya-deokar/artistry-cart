'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { ProfileNavLink } from './ProfileNavLink';
import { User, ShoppingBag, MapPin, Shield, Store, LogOut, Sparkles } from 'lucide-react';
import axiosInstance from '@/utils/axiosinstance';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { gsap } from 'gsap';

// Define the shape of the user data this component needs
interface UserData {
  name: string;
  avatar?: { url: string } | null;
  role?: string;
  email?: string;
  createdAt?: string;
}

export const ProfileSidebar: React.FC<{ user: UserData }> = ({ user }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const clearAll = useStore((state: any) => state.actions.clearAll);
  const { setLoggedIn } = useAuthStore();
  const avatarRingRef = useRef<HTMLDivElement>(null);
  const logoutRef = useRef<HTMLButtonElement>(null);

  const navLinks = [
    { href: '/profile', label: 'My Profile', icon: <User size={20} /> },
    { href: '/profile/orders', label: 'Order History', icon: <ShoppingBag size={20} /> },
    { href: '/profile/addresses', label: 'Address Book', icon: <MapPin size={20} /> },
    { href: '/profile/security', label: 'Security', icon: <Shield size={20} /> },
  ];

  const logOutHandler = async () => {
    try {
      await axiosInstance.get("/auth/api/logout-user");
      setLoggedIn(false);
      clearAll();
      queryClient.clear();
      router.push("/login");
    } catch (error) {
      console.error('Logout failed:', error);
      setLoggedIn(false);
      clearAll();
      queryClient.clear();
      router.push("/login");
    }
  };

  // Avatar hover animation
  const handleAvatarEnter = () => {
    if (avatarRingRef.current) {
      gsap.to(avatarRingRef.current, {
        scale: 1.05,
        boxShadow: '0 0 20px rgba(184, 134, 11, 0.3)',
        borderColor: 'var(--ac-gold)',
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  };

  const handleAvatarLeave = () => {
    if (avatarRingRef.current) {
      gsap.to(avatarRingRef.current, {
        scale: 1,
        boxShadow: '0 0 0 rgba(184, 134, 11, 0)',
        borderColor: 'var(--ac-linen)',
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  };

  // Logout button hover
  const handleLogoutEnter = () => {
    if (logoutRef.current) {
      gsap.to(logoutRef.current, {
        x: 4,
        color: 'var(--ac-error)',
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const handleLogoutLeave = () => {
    if (logoutRef.current) {
      gsap.to(logoutRef.current, {
        x: 0,
        color: 'var(--ac-graphite)',
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  // Format member since date
  const getMemberSince = () => {
    if (!user.createdAt) return null;
    const date = new Date(user.createdAt);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const memberSince = getMemberSince();

  return (
    <div className="relative p-6 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] rounded-xl lg:sticky top-24 overflow-hidden">
      {/* Decorative corner accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-50"
        style={{
          background: 'radial-gradient(circle at top right, var(--ac-gold) 0%, transparent 70%)',
          opacity: 0.08,
        }}
      />

      {/* User Info Section */}
      <div className="flex flex-col items-center pb-6 border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
        {/* Avatar with animated ring */}
        <div
          ref={avatarRingRef}
          onMouseEnter={handleAvatarEnter}
          onMouseLeave={handleAvatarLeave}
          className="relative w-24 h-24 rounded-full border-2 border-[var(--ac-linen)] dark:border-[var(--ac-slate)] p-1 transition-all duration-300 cursor-pointer"
        >
          <div className="relative w-full h-full rounded-full overflow-hidden bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]">
            {user.avatar?.url ? (
              <Image
                src={user.avatar.url}
                alt={user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <User size={32} className="text-[var(--ac-stone)]" />
              </div>
            )}
          </div>

          {/* Sparkle badge for verified/premium users */}
          {user.role === 'SELLER' && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--ac-gold)] flex items-center justify-center shadow-lg">
              <Sparkles size={14} className="text-[var(--ac-ivory)]" />
            </div>
          )}
        </div>

        {/* Name & Email */}
        <div className="mt-4 text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
            {user.name}
          </h2>
          {user.email && (
            <p className="text-sm text-[var(--ac-stone)] dark:text-[var(--ac-silver)] mt-1 truncate max-w-[200px]">
              {user.email}
            </p>
          )}
        </div>

        {/* Member since badge */}
        {memberSince && (
          <div className="mt-3 px-3 py-1.5 rounded-full bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--ac-gold)]" />
            <span className="text-xs text-[var(--ac-stone)] dark:text-[var(--ac-silver)] font-medium tracking-wide">
              Member since {memberSince}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-6 space-y-1.5">
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

      {/* Logout Section */}
      <div className="mt-6 pt-4 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
        <button
          ref={logoutRef}
          onClick={() => logOutHandler()}
          onMouseEnter={handleLogoutEnter}
          onMouseLeave={handleLogoutLeave}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] font-medium transition-all duration-300 hover:bg-[var(--ac-error)]/10"
        >
          <LogOut size={20} />
          <span className="text-[0.9375rem]">Sign Out</span>
        </button>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[var(--ac-gold)]/20 to-transparent" />
    </div>
  );
};