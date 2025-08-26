'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type ProfileNavLinkProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

export const ProfileNavLink: React.FC<ProfileNavLinkProps> = ({ href, icon, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 p-3 rounded-md font-semibold transition-colors",
        isActive
          ? "bg-accent text-white"
          : "text-primary/80 hover:bg-neutral-800"
      )}
    >
      {icon}
      {children}
    </Link>
  );
};