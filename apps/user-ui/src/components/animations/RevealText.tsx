// src/components/animations/RevealText.tsx
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type RevealTextProps = {
  text: string;
  as?: React.ElementType;
  className?: string;
  align?: "center" | "start" | "end";
  duration?: number;
  staggerAmount?: number;
  triggerStart?: string;
};

export const RevealText = ({
  text,
  as: Component = "div",
  className,
  align = "start",
  duration = 0.8,
  staggerAmount = 0.1,
  triggerStart = "top 80%",
}: RevealTextProps) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      const wordsToAnimate = componentRef.current?.querySelectorAll(".reveal-word");
      if (!wordsToAnimate) return;
      
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(wordsToAnimate, {
          y: 0,
          stagger: staggerAmount,
          duration,
          ease: "power3.out",
          scrollTrigger: {
            trigger: componentRef.current,
            start: triggerStart,
            // markers:true,
          },
        });
      });
      
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.to(wordsToAnimate, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'none',
        });
      });

    },
    { scope: componentRef }
  );

  return (
    <Component
      ref={componentRef}
      className={clsx(
        "text-balance",
        {
          "text-center": align === "center",
          "text-right": align === "end",
          "text-left": align === "start",
        },
        className
      )}
    >
      {words.map((word, index) => (
        // Each word is wrapped in a span with overflow hidden to create the mask effect
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden pb-3"
        >
          {/* This inner span is what gets animated upwards */}
          <span className="reveal-word inline-block translate-y-[120%] will-change-transform">
            {word}
            {index < words.length - 1 ? "\u00A0" : ""} {/* Adds a space */}
          </span>
        </span>
      ))}
    </Component>
  );
};