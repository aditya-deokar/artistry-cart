// src/components/common/TransitionLink.tsx
import { type LinkProps } from "next/link";
import { Link } from "next-view-transitions";
import { type ReactNode } from "react";

// The component props extend the standard Next.js LinkProps and HTMLAnchorElement attributes
export type TransitionLinkProps = LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  className?: string; // Explicitly defined, though also in AnchorHTMLAttributes.
};

/**
 * A wrapper around the standard Next.js Link component.
 * This provides a single component for all internal links, making it easy
 * to add page transition libraries or other global link logic in the future.
 */
export const TransitionLink = (props: TransitionLinkProps) => {
  const { href, children, ...rest } = props;

  if (!href) {
    console.warn("TransitionLink: `href` prop is missing.");
    return <span className={props.className}>{children}</span>;
  }

  return (
    <Link
      href={href as any}
      {...rest}
    >
      {children}
    </Link>
  );
};