// src/components/common/Bounded.tsx
import { forwardRef, type ElementType, type ReactNode } from "react";
import clsx from "clsx";

type BoundedProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

// Using forwardRef allows this component to receive a ref and forward it to the underlying DOM element.
// This is useful for animations or direct DOM manipulation from parent components (e.g., with GSAP).
export const Bounded = forwardRef<HTMLElement, BoundedProps>(
  ({ as: Comp = "section", className, children, ...restProps }, ref) => {
    return (
      <Comp
        ref={ref}
        className={clsx(
          // Establishes consistent horizontal padding
          "px-6",
          className,
        )}
        {...restProps}
      >
        {/* The inner div centers the content and sets a max-width */}
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </Comp>
    );
  },
);

// Set a display name for easier debugging in React DevTools
Bounded.displayName = "Bounded";