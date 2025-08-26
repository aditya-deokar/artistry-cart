'use client'
import React from 'react';
import { Bounded } from '@/components/common/Bounded';
import { ProfileSidebar } from '@/components/profile/layout/ProfileSidebar';
import { redirect } from 'next/navigation';
import useUser from '@/hooks/useUser';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isError } = useUser();

  // While fetching user → show loading UI
  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // If request finished but user not found → redirect
  if (!user) {
    redirect('/login');
  }

  return (
    <Bounded>
      <div className="py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <ProfileSidebar user={user} />
          </aside>
          {/* Main Content */}
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
    </Bounded>
  );
}
