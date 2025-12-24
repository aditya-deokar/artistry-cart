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
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-px bg-[var(--ac-gold)]" />
          <p className="text-xs tracking-[0.2em] uppercase text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)] font-medium">
            Personal Details
          </p>
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-tight">
          My Profile
        </h2>
        <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mt-2">
          Manage your personal information and keep your account up to date.
        </p>
      </div>

      {/* Content Cards */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        >
          <AvatarUploader currentAvatarUrl={user.avatar?.url} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        >
          <ProfileUpdateForm currentUser={user} />
        </motion.div>
      </div>
    </motion.div>
  );
};