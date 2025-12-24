'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';

type ProfileNavLinkProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

export const ProfileNavLink: React.FC<ProfileNavLinkProps> = ({ href, icon, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  const linkRef = useRef<HTMLAnchorElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const accentRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    if (isActive) return;

    // Icon animation - subtle scale and rotate
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        scale: 1.1,
        rotate: 5,
        color: 'var(--ac-gold)',
        duration: 0.3,
        ease: 'back.out(2)',
      });
    }

    // Text color shift
    if (textRef.current) {
      gsap.to(textRef.current, {
        color: 'var(--ac-charcoal)',
        x: 4,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    // Background reveal
    if (linkRef.current) {
      gsap.to(linkRef.current, {
        backgroundColor: 'var(--ac-linen)',
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseLeave = () => {
    if (isActive) return;

    // Reset icon
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        scale: 1,
        rotate: 0,
        color: 'var(--ac-graphite)',
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    // Reset text
    if (textRef.current) {
      gsap.to(textRef.current, {
        color: 'var(--ac-graphite)',
        x: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    // Reset background
    if (linkRef.current) {
      gsap.to(linkRef.current, {
        backgroundColor: 'transparent',
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  return (
    <Link
      ref={linkRef}
      href={href}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative flex items-center gap-3 px-4 py-3.5 rounded-lg font-medium transition-all duration-300 group overflow-hidden",
        isActive
          ? "bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]"
          : "bg-transparent hover:bg-[var(--ac-linen)] dark:hover:bg-[var(--ac-slate)]"
      )}
    >
      {/* Active indicator - left accent bar */}
      <span
        ref={accentRef}
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full transition-all duration-300",
          isActive
            ? "bg-[var(--ac-gold)] opacity-100"
            : "bg-transparent opacity-0 group-hover:bg-[var(--ac-gold)]/40 group-hover:opacity-100"
        )}
      />

      {/* Icon */}
      <span
        ref={iconRef}
        className={cn(
          "flex-shrink-0 transition-colors duration-300",
          isActive
            ? "text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)]"
            : "text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]"
        )}
      >
        {icon}
      </span>

      {/* Label */}
      <span
        ref={textRef}
        className={cn(
          "font-[family-name:var(--font-inter)] text-[0.9375rem] tracking-wide transition-all duration-300",
          isActive
            ? "text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] font-semibold"
            : "text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]"
        )}
      >
        {children}
      </span>

      {/* Subtle shimmer on hover for inactive links */}
      {!isActive && (
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <span
            className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(184, 134, 11, 0.08), transparent)',
            }}
          />
        </span>
      )}
    </Link>
  );
};