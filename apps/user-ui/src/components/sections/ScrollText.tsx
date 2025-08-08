// src/components/sections/ScrollText.tsx
"use client";

import { FC, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Bounded } from "../common/Bounded";


gsap.registerPlugin(useGSAP, ScrollTrigger);

type ScrollTextProps = {
  eyebrow: string;
  text: string;
};

export const ScrollText: FC<ScrollTextProps> = ({ eyebrow, text }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const words = text.split(" ");



    useGSAP(
    () => {
      const component = componentRef.current;
      const textElement = textRef.current;
      const contentElement = contentRef.current;
      const letters = textElement?.querySelectorAll("span");

      if (!component || !textElement || !letters || !contentElement) return;

      // Set initial blur and color
      gsap.set(contentElement, { filter: "blur(40px)" });
      gsap.set(letters, { color: "hsl(220, 9%, 20%)" });

      gsap.to(contentElement, {
        filter: "blur(0px)",
        duration: 1,
        scrollTrigger: {
          trigger: component,
          start: "top 75%",
          end: "top top",
          scrub: 2,
          markers:true,

        },
      });

    const colorTl = gsap.timeline({
        scrollTrigger: {
          trigger: component,
          start: "top top",
          end: "bottom -100%", // Animate for a duration equal to the component's height
          pin: true,
          scrub: 3,
          anticipatePin:1,
          pinSpacing: true,
          markers:true,
        },
      });
     colorTl.to(letters, {
        color: "white",
        stagger: 0.1, // Stagger the color change of each letter
        ease: "power1.inOut",
      },"a");

      colorTl.to(
        ".glow-background",
        {
        stagger: 0.05,
        // delay:-1,
          opacity: 1,
          ease: "power2.inOut",
          duration: 1.5,
        },
        "a",
      );
    },
    { scope: componentRef },
  );
  return (
    <div
      ref={componentRef}
      className="relative flex h-svh items-center justify-center bg-background"
    >
        <div className="glow-background absolute inset-0 z-0 h-full w-full opacity-0"></div>
        <div className="absolute inset-0 bg-[url('/noisetexture.jpg')] opacity-30 mix-blend-multiply"></div>


      <div ref={contentRef}>
        <div className="mb-2 text-center text-sm uppercase tracking-wider md:mb-8 md:text-base">
          {eyebrow}
        </div>

        <div ref={textRef} className="text-center">
          <p className="font-display flex flex-wrap justify-center text-5xl font-bold leading-normal text-balance uppercase md:text-7xl">
            {words.map((word, index) => (
              <span key={`${word}-${index}`} className="mr-4 inline-block">
                {word.split("").map((char, charIndex) => (
                  <span key={`${char}-${charIndex}`} className="letter mr-0.5 inline-block">
                    {char}
                  </span>
                ))}
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
};