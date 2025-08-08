// src/components/animations/FadeIn.tsx
"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";

// Register the GSAP plugins
gsap.registerPlugin(useGSAP, ScrollTrigger);

type FadeInProps = {
  children: ReactNode;
  className?: string;
  vars?: gsap.TweenVars; // Allows passing custom GSAP variables
  start?: string; // Custom ScrollTrigger start position
};

export const FadeIn = ({
  children,
  className,
  vars = {},
  start = "top 85%", // Default: trigger when 85% of the viewport is hit
}: FadeInProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Animate only if the user has no preference for reduced motion
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(containerRef.current, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          ...vars, // Apply any custom vars passed in
          scrollTrigger: {
            trigger: containerRef.current,
            start: start,
          },
        });
      });
      
       // A simple fade-in for users who prefer reduced motion
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.to(containerRef.current, {
          opacity: 1,
          duration: 0.5,
          ease: "none",
        });
      });
    },
    { scope: containerRef }
  );

  return (
    // Elements start as invisible and shifted down
    <div ref={containerRef} className={clsx("opacity-0 translate-y-12", className)}>
      {children}
    </div>
  );
};