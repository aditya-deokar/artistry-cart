import { Metadata } from 'next';
import { Navigation } from '@/components/navigation/Navigation';
import { Footer } from '@/components/landing/Footer';
import { FAQPageClient } from './FAQPageClient';

export const metadata: Metadata = {
    title: 'FAQ | Artistry Cart - Frequently Asked Questions',
    description: 'Find answers to common questions about orders, shipping, returns, custom orders, and more at Artistry Cart.',
    openGraph: {
        title: 'Frequently Asked Questions | Artistry Cart',
        description: 'Get quick answers to your questions about shopping at Artistry Cart.',
    },
};

export default function FAQPage() {
    return (
        <main className="min-h-screen bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
            <Navigation />
            <FAQPageClient />
            <Footer />
        </main>
    );
}
