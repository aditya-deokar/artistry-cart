'use client';

import React from 'react';
import { Bounded } from '@/components/common/Bounded';
import { ProfileSidebar } from '@/components/profile/layout/ProfileSidebar';
import { redirect } from 'next/navigation';
import useUser from '@/hooks/useUser';
import Loading from './loading';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();

  // While fetching user → show loading UI
  if (isLoading) {
    return <Loading />;
  }

  // If request finished but user not found → redirect
  if (!user) {
    redirect('/login');
  }

  return (
    <section className="relative min-h-screen bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
      {/* Premium background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--ac-gold)]/20 to-transparent" />

        {/* Subtle radial glow */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] opacity-30"
          style={{
            background: 'radial-gradient(circle at top right, var(--ac-gold) 0%, transparent 60%)',
            opacity: 0.03,
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-30"
          style={{
            background: 'radial-gradient(circle at bottom left, var(--ac-copper) 0%, transparent 60%)',
            opacity: 0.02,
          }}
        />
      </div>

      <Bounded>
        <div className="relative py-12 md:py-16 lg:py-20">
          {/* Page Header */}
          <div className="mb-10 md:mb-12">
            <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] mb-3 font-medium">
              My Account
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-tight">
              Welcome back, <span className="text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)]">{user.name?.split(' ')[0]}</span>
            </h1>
            <p className="mt-3 text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] text-lg max-w-xl">
              Manage your profile, track orders, and explore your creative journey with us.
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <ProfileSidebar user={user} />
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              {children}
            </main>
          </div>
        </div>
      </Bounded>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--ac-gold)]/20 to-transparent" />
    </section>
  );
}
