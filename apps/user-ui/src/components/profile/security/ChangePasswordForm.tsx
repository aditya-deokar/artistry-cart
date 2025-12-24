'use client';

import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff, LoaderCircle, Lock, Check } from 'lucide-react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';

export const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // Input focus animation
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    gsap.to(e.currentTarget, {
      borderColor: 'var(--ac-gold)',
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    gsap.to(e.currentTarget, {
      borderColor: 'var(--ac-linen)',
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Omit<typeof formData, 'confirmPassword'>) => {
      return axiosInstance.post('/auth/api/change-password', data);
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });

      // Success animation
      if (submitButtonRef.current) {
        gsap.to(submitButtonRef.current, {
          scale: 1.05,
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        });
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }
    mutate({ currentPassword: formData.currentPassword, newPassword: formData.newPassword });
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['var(--ac-error)', 'var(--ac-warning)', 'var(--ac-gold)', 'var(--ac-success)'];

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onSubmit={handleSubmit}
      className="relative p-8 border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] rounded-xl bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] overflow-hidden max-w-xl"
    >
      {/* Decorative corner */}
      <div
        className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top right, var(--ac-gold) 0%, transparent 70%)',
          opacity: 0.05,
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
        <div className="w-10 h-10 rounded-full bg-[var(--ac-gold)]/10 flex items-center justify-center">
          <Shield size={20} className="text-[var(--ac-gold)]" />
        </div>
        <div>
          <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
            Change Password
          </h3>
          <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] text-sm">
            Ensure your account stays secure
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Current Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-wide flex items-center gap-2">
            <Lock size={14} className="text-[var(--ac-stone)]" />
            Current Password
          </label>
          <div className="relative">
            <Input
              type={showPasswords.current ? 'text' : 'password'}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              required
              className="h-12 pr-12 rounded-lg bg-[var(--ac-ivory)] dark:bg-[var(--ac-slate)] border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] focus:border-[var(--ac-gold)] focus:ring-[var(--ac-gold)]/20 transition-all duration-300"
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ac-stone)] hover:text-[var(--ac-charcoal)] transition-colors"
            >
              {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-wide flex items-center gap-2">
            <Lock size={14} className="text-[var(--ac-stone)]" />
            New Password
          </label>
          <div className="relative">
            <Input
              type={showPasswords.new ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              required
              className="h-12 pr-12 rounded-lg bg-[var(--ac-ivory)] dark:bg-[var(--ac-slate)] border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] focus:border-[var(--ac-gold)] focus:ring-[var(--ac-gold)]/20 transition-all duration-300"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ac-stone)] hover:text-[var(--ac-charcoal)] transition-colors"
            >
              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Password strength indicator */}
          {formData.newPassword && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: i < passwordStrength
                        ? strengthColors[passwordStrength - 1]
                        : 'var(--ac-linen)',
                    }}
                  />
                ))}
              </div>
              <p
                className="text-xs font-medium"
                style={{ color: strengthColors[passwordStrength - 1] || 'var(--ac-stone)' }}
              >
                {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Enter password'}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] tracking-wide flex items-center gap-2">
            <Lock size={14} className="text-[var(--ac-stone)]" />
            Confirm New Password
          </label>
          <div className="relative">
            <Input
              type={showPasswords.confirm ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              required
              className="h-12 pr-12 rounded-lg bg-[var(--ac-ivory)] dark:bg-[var(--ac-slate)] border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] focus:border-[var(--ac-gold)] focus:ring-[var(--ac-gold)]/20 transition-all duration-300"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ac-stone)] hover:text-[var(--ac-charcoal)] transition-colors"
            >
              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Password match indicator */}
          {formData.confirmPassword && (
            <div className="flex items-center gap-1.5 mt-1">
              {formData.newPassword === formData.confirmPassword ? (
                <>
                  <Check size={14} className="text-[var(--ac-success)]" />
                  <span className="text-xs text-[var(--ac-success)]">Passwords match</span>
                </>
              ) : (
                <span className="text-xs text-[var(--ac-error)]">Passwords do not match</span>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-lg bg-[var(--ac-error)]/10 border border-[var(--ac-error)]/20">
            <p className="text-sm text-[var(--ac-error)]">{error}</p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 mt-6 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
        <Button
          ref={submitButtonRef}
          type="submit"
          disabled={isPending}
          className="px-8 h-12 rounded-full bg-[var(--ac-charcoal)] hover:bg-[var(--ac-gold)] text-[var(--ac-ivory)] font-medium tracking-wide transition-all duration-300 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <LoaderCircle className="animate-spin mr-2" size={18} />
              Updating...
            </>
          ) : (
            'Update Password'
          )}
        </Button>
      </div>
    </motion.form>
  );
};