import React from 'react';
import { AvatarUploader } from './AvatarUploader';
import { ProfileUpdateForm } from './ProfileUpdateForm';

export const ProfileDetailsView = ({ user }: { user: any }) => {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="font-display text-3xl">My Profile</h2>
        <p className="text-primary/70">Manage your personal information and profile picture.</p>
      </div>
      <AvatarUploader currentAvatarUrl={user.avatar?.url} />
      <ProfileUpdateForm currentUser={user} />
    </div>
  );
};