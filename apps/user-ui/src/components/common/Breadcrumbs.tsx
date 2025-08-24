'use client';

import React, { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';


export const Breadcrumbs = () => {
  const pathname = usePathname();

  // Don't render on the home page
  if (pathname === '/') {
    return null;
  }
 

  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="w-[80%]">
      <ol className="container mx-auto flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-3 text-sm">
        {/* Home Link */}
        <li>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
        </li>

        {/* Dynamic Segments */}
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const isLast = index === segments.length - 1;

          // Format the segment to be human-readable (e.g., 'classic-teak-cart' -> 'Classic Teak Cart')
          const label = segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());

          return (
            <Fragment key={href}>
              <li>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </li>
              <li
                className={cn(
                  'font-medium',
                  isLast ? 'text-foreground' : 'text-muted-foreground hover:text-foreground transition-colors'
                )}
              >
                {isLast ? (
                  <span>{label}</span>
                ) : (
                  <Link href={href}>
                    {label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
};