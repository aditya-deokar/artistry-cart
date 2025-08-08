// src/components/animations/AnimateWrapper.tsx
'use client';

import { cn } from '@/lib/utils';
import React from 'react';

type Props = {
    children: React.ReactNode;
    // This className will be applied to the inner div that GSAP animates
    className?: string;
    // Optional className for the outer (masking) div
    wrapperClassName?: string;
};

/**
 * A simple wrapper that creates a masking effect with `overflow: hidden`.
 * The inner child is the element that will be animated by GSAP.
 */
const AnimateWrapper = ({ children, className, wrapperClassName }: Props) => {
    return (
        <div className={cn("overflow-hidden", wrapperClassName)}>
            <div className={className}>
                {children}
            </div>
        </div>
    );
};

export default AnimateWrapper;