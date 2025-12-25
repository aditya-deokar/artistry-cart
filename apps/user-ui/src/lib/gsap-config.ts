'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

// Register plugins globally
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// Animation Presets
export const animationPresets = {
    // Fade In from Bottom
    fadeInUp: {
        from: { opacity: 0, y: 60 },
        to: (trigger: HTMLElement) => ({
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
            },
        }),
    },

    // Fade In from Left
    fadeInLeft: {
        from: { opacity: 0, x: -60 },
        to: (trigger: HTMLElement) => ({
            opacity: 1,
            x: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger,
                start: 'top 70%',
            },
        }),
    },

    // Fade In from Right
    fadeInRight: {
        from: { opacity: 0, x: 60 },
        to: (trigger: HTMLElement) => ({
            opacity: 1,
            x: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger,
                start: 'top 70%',
            },
        }),
    },

    // Scale In
    scaleIn: {
        from: { opacity: 0, scale: 0.9 },
        to: (trigger: HTMLElement) => ({
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.2)',
            scrollTrigger: {
                trigger,
                start: 'top 80%',
            },
        }),
    },

    // Stagger Children
    staggerChildren: (
        container: HTMLElement,
        childSelector: string,
        delay = 0.1
    ) => {
        const children = container.querySelectorAll(childSelector);

        gsap.fromTo(
            children,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power3.out',
                stagger: delay,
                scrollTrigger: {
                    trigger: container,
                    start: 'top 80%',
                },
            }
        );
    },
};

// Utility Hooks
export function useScrollReveal(ref: React.RefObject<HTMLElement>) {
    useGSAP(
        () => {
            if (!ref.current) return;

            gsap.fromTo(
                ref.current,
                { opacity: 0, y: 50 },
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
}
