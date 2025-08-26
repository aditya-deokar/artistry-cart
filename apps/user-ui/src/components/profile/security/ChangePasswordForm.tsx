'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if(error) setError('');
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Omit<typeof formData, 'confirmPassword'>) => {
      return axiosInstance.post('/auth/api/change-password', data);
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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

  return (
    <form onSubmit={handleSubmit} className="p-6 border border-neutral-800 rounded-lg space-y-4 max-w-lg">
      <h3 className="font-semibold text-lg">Change Password</h3>
      <div>
        <label className="block text-sm font-medium mb-1">Current Password</label>
        <Input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">New Password</label>
        <Input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
        <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Updating...' : 'Update Password'}
        </Button>
      </div>
    </form>
  );
};