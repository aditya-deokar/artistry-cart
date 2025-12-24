'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosinstance';
import { Button } from '@/components/ui/button';
import { Camera, LoaderCircle, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { gsap } from 'gsap';

type AvatarUploaderProps = {
  currentAvatarUrl?: string | null;
};

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({ currentAvatarUrl }) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarRingRef = useRef<HTMLDivElement>(null);
  const cameraButtonRef = useRef<HTMLButtonElement>(null);

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
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setFile(null);
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

  // Avatar hover animations
  const handleAvatarEnter = () => {
    if (avatarRingRef.current) {
      gsap.to(avatarRingRef.current, {
        scale: 1.02,
        boxShadow: '0 0 30px rgba(184, 134, 11, 0.25)',
        duration: 0.4,
        ease: 'power2.out',
      });
    }
    if (cameraButtonRef.current) {
      gsap.to(cameraButtonRef.current, {
        scale: 1.1,
        backgroundColor: 'var(--ac-gold)',
        duration: 0.3,
        ease: 'back.out(2)',
      });
    }
  };

  const handleAvatarLeave = () => {
    if (avatarRingRef.current) {
      gsap.to(avatarRingRef.current, {
        scale: 1,
        boxShadow: '0 0 0 rgba(184, 134, 11, 0)',
        duration: 0.4,
        ease: 'power2.out',
      });
    }
    if (cameraButtonRef.current) {
      gsap.to(cameraButtonRef.current, {
        scale: 1,
        backgroundColor: 'var(--ac-charcoal)',
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  return (
    <div className="relative p-8 border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] rounded-xl bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] overflow-hidden group">
      {/* Decorative corner accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50"
        style={{
          background: 'radial-gradient(circle at top right, var(--ac-gold) 0%, transparent 70%)',
          opacity: 0.05,
        }}
      />

      <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
        {/* Avatar with ring */}
        <div
          ref={avatarRingRef}
          onMouseEnter={handleAvatarEnter}
          onMouseLeave={handleAvatarLeave}
          className="relative cursor-pointer"
        >
          {/* Golden ring wrapper */}
          <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-br from-[var(--ac-gold)]/30 via-[var(--ac-gold)]/10 to-transparent">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-[var(--ac-cream)] dark:border-[var(--ac-onyx)] shadow-lg bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)]">
              {preview ? (
                <Image src={preview} alt="Avatar Preview" fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-[var(--ac-stone)]">
                  <span className="text-5xl font-light">?</span>
                </div>
              )}
            </div>
          </div>

          {/* Camera button */}
          <button
            ref={cameraButtonRef}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 bg-[var(--ac-charcoal)] dark:bg-[var(--ac-pearl)] text-[var(--ac-ivory)] dark:text-[var(--ac-obsidian)] p-2.5 rounded-full shadow-lg transition-all duration-300"
            aria-label="Change profile picture"
          >
            <Camera size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 text-center sm:text-left">
          <div>
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)]">
              Profile Picture
            </h3>
            <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] text-sm mt-2 leading-relaxed">
              Upload a high-quality image (up to 2MB) that represents your creative identity.
              <br className="hidden sm:block" />
              <span className="text-[var(--ac-stone)] dark:text-[var(--ac-ash)]">
                Supported formats: JPG, PNG, WEBP
              </span>
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
            {file ? (
              <>
                <Button
                  onClick={handleUpload}
                  disabled={isPending}
                  className="rounded-full px-6 bg-[var(--ac-charcoal)] hover:bg-[var(--ac-gold)] text-[var(--ac-ivory)] transition-all duration-300"
                >
                  {isPending && <LoaderCircle className="animate-spin mr-2" size={16} />}
                  Save Photo
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { setFile(null); setPreview(currentAvatarUrl || null); }}
                  className="rounded-full px-6 text-[var(--ac-graphite)] hover:text-[var(--ac-error)] hover:bg-[var(--ac-error)]/10"
                >
                  <X size={16} className="mr-1" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full px-6 border-[var(--ac-linen)] dark:border-[var(--ac-slate)] hover:border-[var(--ac-gold)] hover:text-[var(--ac-gold)] transition-all duration-300"
              >
                <Upload size={16} className="mr-2" />
                Upload New Photo
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};