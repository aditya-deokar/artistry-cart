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
    <div className="p-8 border border-border rounded-xl bg-card">
      <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background ring-2 ring-border shadow-lg bg-muted relative">
            {preview ? (
              <Image src={preview} alt="Avatar Preview" fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                <span className="text-4xl">?</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-2 rounded-full shadow-md hover:bg-primary/90 transition-colors"
            aria-label="Change profile picture"
          >
            <Camera size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 text-center sm:text-left">
          <div>
            <h3 className="font-display text-xl font-semibold">Profile Picture</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Upload a high-quality (up to 2MB) image to represent your creative identity.
              <br className="hidden sm:block" /> Supported formats: JPG, PNG, WEBP.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />

          <div className="flex items-center justify-center sm:justify-start gap-4 pt-2">
            {file ? (
              <>
                <Button onClick={handleUpload} disabled={isPending} className="rounded-full px-6">
                  {isPending && <LoaderCircle className="animate-spin mr-2" size={16} />}
                  Save Photo
                </Button>
                <Button variant="ghost" onClick={() => { setFile(null); setPreview(currentAvatarUrl || null); }} className="rounded-full px-6">
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-full px-6 border-primary/20 hover:border-primary">
                Upload New Photo
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};