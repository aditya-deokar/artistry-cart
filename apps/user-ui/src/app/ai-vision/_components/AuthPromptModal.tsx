'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: 'save' | 'send' | 'favorite' | 'delete';
  onContinueAsGuest?: () => void;
}

const actionMessages = {
  save: {
    title: 'Save this concept',
    description: 'Sign in to save this concept to your library and access it anytime.',
    benefits: ['Save unlimited concepts', 'Track concept status', 'Access from any device', 'Never lose your ideas'],
  },
  send: {
    title: 'Send to artisans',
    description: 'Sign in to connect with artisans who can bring your concept to life.',
    benefits: ['Get custom quotes', 'Track artisan responses', 'Message directly', 'Secure payment options'],
  },
  favorite: {
    title: 'Save to favorites',
    description: 'Sign in to build your collection of inspiring concepts.',
    benefits: ['Organize favorites', 'Get similar recommendations', 'Share collections', 'Track what inspires you'],
  },
  delete: {
    title: 'Manage your concepts',
    description: 'Sign in to manage and organize your concept library.',
    benefits: ['Delete concepts', 'Create folders', 'Export designs', 'Full control'],
  },
};

export default function AuthPromptModal({
  open,
  onOpenChange,
  action,
  onContinueAsGuest,
}: AuthPromptModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const message = actionMessages[action];

  const handleSignIn = () => {
    setLoading(true);
    // Store the current page to return after login
    localStorage.setItem('redirect_after_auth', window.location.pathname);
    router.push('/login');
  };

  const handleSignUp = () => {
    setLoading(true);
    localStorage.setItem('redirect_after_auth', window.location.pathname);
    router.push('/register');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--ac-gold)]/10 dark:bg-[var(--ac-gold-dark)]/10 mb-4 mx-auto">
            <Sparkles className="h-6 w-6 text-[var(--ac-gold)] dark:text-[var(--ac-gold-dark)]" />
          </div>
          <DialogTitle className="text-center text-xl">{message.title}</DialogTitle>
          <DialogDescription className="text-center">
            {message.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--ac-graphite)] dark:text-[var(--ac-silver)]">
              With an account you can:
            </p>
            <ul className="space-y-1">
              {message.benefits.map((benefit, index) => (
                <li
                  key={index}
                  className="text-sm text-[var(--ac-stone)] flex items-start"
                >
                  <span className="text-[var(--ac-gold)] mr-2">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              className="w-full bg-[var(--ac-charcoal)] hover:bg-[var(--ac-gold)] dark:bg-[var(--ac-pearl)] dark:hover:bg-[var(--ac-gold-dark)]"
              size="lg"
              onClick={handleSignIn}
              disabled={loading}
            >
              <LogIn className="mr-2 h-5 w-5" />
              Sign In
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleSignUp}
              disabled={loading}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Create Account
            </Button>
          </div>

          {/* Continue as Guest (only for non-critical actions) */}
          {onContinueAsGuest && action !== 'send' && (
            <div className="pt-2 border-t border-[var(--ac-linen)] dark:border-[var(--ac-slate)]">
              <Button
                variant="ghost"
                className="w-full text-sm text-[var(--ac-stone)] hover:text-[var(--ac-charcoal)] dark:hover:text-[var(--ac-pearl)]"
                onClick={() => {
                  onContinueAsGuest();
                  onOpenChange(false);
                }}
              >
                Continue as guest
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
