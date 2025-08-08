// src/components/common/Lazy.tsx
"use client";

import { useState, useEffect, useRef, type ReactNode, type ComponentProps } from "react";

type LazyProps = ComponentProps<"div"> & {
  children: ReactNode;
  rootMargin?: string; // e.g., "100px 0px" to load 100px before it's visible
};

export const Lazy = ({ children, rootMargin = "0px", ...restProps }: LazyProps) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the component is intersecting with the viewport, update state.
        if (entry.isIntersecting) {
          setIsInView(true);
          // Stop observing once it's visible to save resources.
          if (currentRef) {
            observer.unobserve(currentRef);
          }
        }
      },
      { rootMargin } // The `rootMargin` allows you to load content before it's on screen.
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    // Cleanup function to unobserve the element when the component unmounts.
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [rootMargin]);

  // Render a placeholder div until it's in view, then render the actual children.
  return (
    <div ref={ref} {...restProps}>
      {isInView ? children : null}
    </div>
  );
};