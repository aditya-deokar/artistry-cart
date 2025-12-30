import { Suspense } from 'react';
import { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/landing';
import AIVisionDiscovery from './_components/AIVisionDiscovery';

export const metadata: Metadata = {
  title: 'AI Vision Discovery | Artistry Cart',
  description:
    'Generate custom designs with AI. Browse inspiring concepts from thousands of AI-generated artworks. Connect with artisans who bring your vision to life.',
  openGraph: {
    title: 'AI Vision Discovery | Artistry Cart',
    description: 'Transform your imagination into reality with AI-powered custom art creation.',
    type: 'website',
    images: ['/images/og-ai-vision.jpg'],
  },
  keywords: [
    'AI art generation',
    'custom design',
    'AI vision',
    'artisan collaboration',
    'concept design',
    'AI artwork',
    'custom commissions',
  ],
};

export default function AIVisionPage() {
  return (
    <>
      <Navigation />

      <main>
        <Suspense fallback={<AIVisionSkeleton />}>
          <AIVisionDiscovery />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}

function AIVisionSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
      {/* Hero Skeleton */}
      <div className="min-h-[60vh] flex items-center pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="text-center space-y-6 animate-pulse">
            <div className="h-4 w-32 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] mx-auto" />
            <div className="space-y-3">
              <div className="h-12 w-3/4 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] mx-auto" />
              <div className="h-12 w-1/2 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] mx-auto" />
            </div>
            <div className="h-24 w-2/3 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] mx-auto" />
            <div className="h-14 w-64 bg-[var(--ac-linen)] dark:bg-[var(--ac-slate)] mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
