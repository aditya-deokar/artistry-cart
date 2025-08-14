'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

type ReadMoreProps = {
  htmlContent: string;
  maxHeight?: number; // Max height in pixels before truncating
};

export const ReadMoreDescription: React.FC<ReadMoreProps> = ({ htmlContent, maxHeight = 150 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && contentRef.current.scrollHeight > maxHeight) {
      setIsTruncated(true);
    }
  }, [htmlContent, maxHeight]);

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className={cn(
          "prose prose-invert max-w-none prose-p:text-primary/90 transition-all duration-500 ease-in-out overflow-hidden",
          !isExpanded && isTruncated && "mask-gradient"
        )}
        style={{ maxHeight: isExpanded ? contentRef.current?.scrollHeight : maxHeight }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      {isTruncated && (
        <div className="mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="font-semibold text-accent hover:underline"
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        </div>
      )}
      <style jsx>{`
        .mask-gradient {
          mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
        }
      `}</style>
    </div>
  );
};