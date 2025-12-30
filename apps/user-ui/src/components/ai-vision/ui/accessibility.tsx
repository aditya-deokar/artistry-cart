'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Focus trap for modals
 * Keeps focus within the modal when tabbing
 */
export function useFocusTrap(isActive: boolean) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Focus first element on mount
        firstElement?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);
        return () => container.removeEventListener('keydown', handleKeyDown);
    }, [isActive]);

    return containerRef;
}

/**
 * Announce messages to screen readers
 */
export function useScreenReaderAnnounce() {
    const announceRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // Create the announcer element if it doesn't exist
        if (!announceRef.current) {
            const announcer = document.createElement('div');
            announcer.setAttribute('role', 'status');
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            announcer.style.cssText = `
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            `;
            document.body.appendChild(announcer);
            announceRef.current = announcer;
        }

        return () => {
            if (announceRef.current) {
                document.body.removeChild(announceRef.current);
                announceRef.current = null;
            }
        };
    }, []);

    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        if (!announceRef.current) return;

        announceRef.current.setAttribute('aria-live', priority);
        announceRef.current.textContent = '';

        // Force re-announcement by briefly clearing and resetting
        requestAnimationFrame(() => {
            if (announceRef.current) {
                announceRef.current.textContent = message;
            }
        });
    }, []);

    return announce;
}

/**
 * Hook for keyboard navigation in a grid/list
 */
export function useGridKeyboardNavigation<T extends HTMLElement>(
    items: Array<{ id: string }>,
    onSelect: (id: string) => void,
    columns: number = 4
) {
    const containerRef = useRef<T>(null);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!items.length) return;

        let newIndex = focusedIndex;

        switch (e.key) {
            case 'ArrowRight':
                e.preventDefault();
                newIndex = Math.min(focusedIndex + 1, items.length - 1);
                break;
            case 'ArrowLeft':
                e.preventDefault();
                newIndex = Math.max(focusedIndex - 1, 0);
                break;
            case 'ArrowDown':
                e.preventDefault();
                newIndex = Math.min(focusedIndex + columns, items.length - 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                newIndex = Math.max(focusedIndex - columns, 0);
                break;
            case 'Home':
                e.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                newIndex = items.length - 1;
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < items.length) {
                    onSelect(items[focusedIndex].id);
                }
                return;
            default:
                return;
        }

        setFocusedIndex(newIndex);

        // Focus the element
        if (containerRef.current) {
            const focusableItems = containerRef.current.querySelectorAll<HTMLElement>(
                '[data-gallery-item]'
            );
            focusableItems[newIndex]?.focus();
        }
    }, [focusedIndex, items, columns, onSelect]);

    return {
        containerRef,
        focusedIndex,
        setFocusedIndex,
        handleKeyDown,
        getItemProps: (index: number) => ({
            'data-gallery-item': true,
            tabIndex: index === focusedIndex ? 0 : -1,
            onFocus: () => setFocusedIndex(index),
        }),
    };
}

/**
 * Skip to content link for keyboard users
 */
export function SkipToContent({ targetId = 'main-content' }: { targetId?: string }) {
    return (
        <a
            href={`#${targetId}`}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--av-gold)] focus:text-black focus:rounded-lg focus:font-bold focus:outline-none"
        >
            Skip to main content
        </a>
    );
}

/**
 * Generation progress announcer
 */
export function useGenerationProgressAnnouncer(progress: number, isGenerating: boolean) {
    const announce = useScreenReaderAnnounce();
    const lastAnnouncedProgress = useRef(0);

    useEffect(() => {
        if (!isGenerating) {
            lastAnnouncedProgress.current = 0;
            return;
        }

        // Announce at key milestones
        const milestones = [0, 25, 50, 75, 100];
        const currentMilestone = milestones.find(m =>
            progress >= m && lastAnnouncedProgress.current < m
        );

        if (currentMilestone !== undefined) {
            let message = '';
            switch (currentMilestone) {
                case 0:
                    message = 'Generation started. Analyzing your request.';
                    break;
                case 25:
                    message = '25% complete. Generating concepts.';
                    break;
                case 50:
                    message = '50% complete. Refining details.';
                    break;
                case 75:
                    message = '75% complete. Almost done.';
                    break;
                case 100:
                    message = 'Generation complete! Your concepts are ready.';
                    break;
            }

            if (message) {
                announce(message);
                lastAnnouncedProgress.current = currentMilestone;
            }
        }
    }, [progress, isGenerating, announce]);
}

/**
 * Reduced motion preference detector
 */
export function usePrefersReducedMotion(): boolean {
    const [prefersReduced, setPrefersReduced] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReduced(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => {
            setPrefersReduced(e.matches);
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    return prefersReduced;
}
