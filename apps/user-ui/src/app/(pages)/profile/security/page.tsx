import { ChangePasswordForm } from '@/components/profile/security/ChangePasswordForm';
import React from 'react';

export default function SecurityPage() {
    return (
        <div className="space-y-8">
             <div>
                <h2 className="font-display text-3xl">Security</h2>
                <p className="text-primary/70">Change your password and manage account security.</p>
            </div>
            <ChangePasswordForm />
        </div>
    );
}