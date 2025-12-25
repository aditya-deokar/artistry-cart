'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

interface SectionContainerProps extends HTMLAttributes<HTMLElement> {
    variant?: 'dark' | 'light' | 'gradient';
    animate?: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const SectionContainer = forwardRef<HTMLElement, SectionContainerProps>(
    (
        {
            variant = 'light',
            animate = true,
            maxWidth = 'xl',
            className,
            children,
            ...props
        },
        forwardedRef
    ) => {
        const sectionRef = useRef<HTMLElement>(null);
        const contentRef = useRef<HTMLDivElement>(null);
        const ref = (forwardedRef as React.RefObject<HTMLElement>) || sectionRef;

        useGSAP(
            () => {
                if (!animate || !contentRef.current) return;

                gsap.fromTo(
                    contentRef.current,
                    {
                        opacity: 0,
                        y: 60,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: ref.current,
                            start: 'top 80%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            },
            { scope: ref }
        );

        const variants = {
            dark: 'bg-[var(--av-obsidian)] text-[var(--av-pearl)]',
            light: 'bg-[var(--av-ivory)] text-[var(--av-obsidian)]',
            gradient: 'bg-gradient-to-br from-[var(--av-obsidian)] via-[var(--av-onyx)] to-[var(--av-obsidian)] text-[var(--av-pearl)]',
        };

        const maxWidths = {
            sm: 'max-w-3xl',
            md: 'max-w-5xl',
            lg: 'max-w-6xl',
            xl: 'max-w-7xl',
            full: 'max-w-full',
        };

        return (
            <section
                ref={ref}
                className={cn(
                    'relative py-16 md:py-24 lg:py-32 px-6 md:px-8',
                    'overflow-hidden',
                    variants[variant],
                    className
                )}
                {...props}
            >
                <div
                    ref={contentRef}
                    className={cn('mx-auto w-full', maxWidths[maxWidth])}
                >
                    {children}
                </div>
            </section>
        );
    }
);

SectionContainer.displayName = 'SectionContainer';
