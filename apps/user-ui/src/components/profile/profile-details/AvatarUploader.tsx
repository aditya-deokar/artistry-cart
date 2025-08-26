'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';

import { Button } from '@/components/ui/button';
import { Camera, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';

type AvatarUploaderProps = {
  currentAvatarUrl?: string | null;
};

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({ currentAvatarUrl }) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: FormData) => {
      return axiosInstance.post('/users/api/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      toast.success('Avatar updated successfully!');
      // Invalidate both the specific profile query and the global user query
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setFile(null); // Clear the file after successful upload
    },
    onError: () => {
      toast.error('Failed to upload avatar. Please try again.');
    }
  });

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    mutate(formData);
  };

  return (
    <div className="p-6 border border-neutral-800 rounded-lg">
      <h3 className="font-semibold text-lg mb-4">Profile Picture</h3>
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 rounded-full bg-neutral-800 flex-shrink-0">
          {preview && (
            <Image src={preview} alt="Avatar Preview" fill className="object-cover rounded-full" />
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
            aria-label="Change profile picture"
          >
            <Camera size={24} />
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />
        <div className="flex flex-col gap-2">
          <p className="text-sm text-primary/70">JPG, PNG, or WEBP. 2MB max.</p>
          {file ? (
            <div className="flex items-center gap-2">
                <Button onClick={handleUpload} disabled={isPending}>
                    {isPending && <LoaderCircle className="animate-spin mr-2" size={16} />}
                    Save Photo
                </Button>
                <Button variant="ghost" onClick={() => { setFile(null); setPreview(currentAvatarUrl || null); }}>Cancel</Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Upload Photo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};