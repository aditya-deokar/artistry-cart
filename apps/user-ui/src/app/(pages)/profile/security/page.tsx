'use client';

import { ChangePasswordForm } from '@/components/profile/security/ChangePasswordForm';
import React from 'react';
import { motion } from 'framer-motion';

export default function SecurityPage() {
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
                        Account Protection
                    </p>
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-tight">
                    Security Settings
                </h2>
                <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mt-2">
                    Manage your password and keep your account secure.
                </p>
            </div>

            <ChangePasswordForm />
        </motion.div>
    );
}