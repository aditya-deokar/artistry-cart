'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'premium';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    glow?: boolean;
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            icon,
            iconPosition = 'right',
            glow = false,
            className,
            children,
            ...props
        },
        forwardedRef
    ) => {
        const buttonRef = useRef<HTMLButtonElement>(null);
        const ref = (forwardedRef as React.RefObject<HTMLButtonElement>) || buttonRef;

        // GSAP Hover Animation
        useGSAP(() => {
            const button = ref.current;
            if (!button) return;

            const handleMouseEnter = () => {
                gsap.to(button, {
                    y: -2,
                    scale: 1.02,
                    duration: 0.3,
                    ease: 'power2.out',
                });

                if (glow) {
                    gsap.to(button, {
                        boxShadow: '0 8px 32px rgba(212, 168, 75, 0.5)',
                        duration: 0.3,
                    });
                }
            };

            const handleMouseLeave = () => {
                gsap.to(button, {
                    y: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out',
                });

                if (glow) {
                    gsap.to(button, {
                        boxShadow: '0 8px 32px rgba(212, 168, 75, 0.3)',
                        duration: 0.3,
                    });
                }
            };

            button.addEventListener('mouseenter', handleMouseEnter);
            button.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                button.removeEventListener('mouseenter', handleMouseEnter);
                button.removeEventListener('mouseleave', handleMouseLeave);
            };
        }, { scope: ref });

        const variants = {
            primary: 'bg-[var(--av-gold)] text-[var(--av-obsidian)] hover:bg-[var(--av-gold-dark)]',
            secondary: 'bg-transparent border-2 border-[var(--av-gold)] text-[var(--av-gold)] hover:bg-[var(--av-gold)]/10',
            ghost: 'bg-transparent text-[var(--av-pearl)] hover:bg-white/10',
            premium: 'bg-gradient-to-r from-[var(--av-gold)] to-[var(--av-gold-light)] text-[var(--av-obsidian)]',
        };

        const sizes = {
            sm: 'px-4 py-2 text-sm',
            md: 'px-6 py-3 text-base',
            lg: 'px-8 py-4 text-lg',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center gap-3',
                    'font-semibold tracking-wide',
                    'rounded-none', // Sharp edges for premium feel
                    'transition-all duration-300',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--av-gold)] focus:ring-offset-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    variants[variant],
                    sizes[size],
                    glow && 'shadow-[var(--av-shadow-gold)]',
                    className
                )}
                {...props}
            >
                {icon && iconPosition === 'left' && <span>{icon}</span>}
                <span>{children}</span>
                {icon && iconPosition === 'right' && <span>{icon}</span>}
            </button>
        );
    }
);

PremiumButton.displayName = 'PremiumButton';
