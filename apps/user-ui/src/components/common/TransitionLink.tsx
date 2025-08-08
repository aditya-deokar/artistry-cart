// src/components/common/TransitionLink.tsx
import  { type LinkProps } from "next/link";
import { Link } from "next-view-transitions";
import { type ReactNode, type MouseEventHandler } from "react";

// The component props extend the standard Next.js LinkProps
export type TransitionLinkProps = LinkProps & {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  tabIndex?: number;
};

/**
 * A wrapper around the standard Next.js Link component.
 * This provides a single component for all internal links, making it easy
 * to add page transition libraries or other global link logic in the future.
 */
export const TransitionLink = ({
  children,
  className,
  onClick,
  tabIndex,
  href,
  ...rest
}: TransitionLinkProps) => {
  // If no href is provided, it's not a valid link.
  if (!href) {
    console.warn("TransitionLink: `href` prop is missing.");
    // Render a non-interactive span to avoid breaking the layout.
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      href={href}
      className={className}
      onClick={onClick}
      tabIndex={tabIndex}
      {...rest}
    >
      {children}
    </Link>
  );
};