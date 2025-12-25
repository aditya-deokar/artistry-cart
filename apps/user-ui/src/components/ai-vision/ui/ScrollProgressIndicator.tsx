'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScrollProgressIndicator() {
    const barRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.fromTo(barRef.current,
            { scaleX: 0 },
            {
                scaleX: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: 'body',
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 0.1
                }
            }
        );
    }, { scope: barRef });

    return (
        <div className="fixed top-0 left-0 w-full h-1 z-[1000] pointer-events-none">
            <div
                ref={barRef}
                className="h-full w-full bg-gradient-to-r from-[var(--av-gold)] via-amber-400 to-[var(--av-gold)] origin-left shadow-[0_0_10px_rgba(212,168,75,0.5)]"
            />
        </div>
    );
}
