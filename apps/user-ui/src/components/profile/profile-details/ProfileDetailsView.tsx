'use client';
import React from 'react';
import { AvatarUploader } from './AvatarUploader';
import { ProfileUpdateForm } from './ProfileUpdateForm';
import { motion } from 'framer-motion';

export const ProfileDetailsView = ({ user }: { user: any }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground mt-2 text-lg">Manage your personal information and account settings.</p>
      </div>

      <div className="space-y-8">
        <AvatarUploader currentAvatarUrl={user.avatar?.url} />
        <ProfileUpdateForm currentUser={user} />
      </div>
    </motion.div>
  );
};