import { Metadata } from 'next';
import { Navigation } from '@/components/navigation/Navigation';
import { Footer } from '@/components/landing/Footer';
import {
    SupportHero,
    SupportBreadcrumb,
    NeedHelpCTA,
    QuickLinks,
    PolicyHighlights,
    ReturnProcess,
    ReturnConditions,
    EligibilityChecker,
    RefundInfo,
} from '@/components/support';

export const metadata: Metadata = {
    title: 'Returns & Exchanges | Artistry Cart',
    description: '30-day hassle-free returns at Artistry Cart. Learn about our return policy, process, and refund timeline.',
    openGraph: {
        title: 'Easy Returns & Exchanges | Artistry Cart',
        description: 'Satisfaction guaranteed with our 30-day return policy.',
    },
};

export default function ReturnsPage() {
    return (
        <main className="min-h-screen bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
            <Navigation />

            {/* Breadcrumb */}
            <SupportBreadcrumb items={[{ label: 'Returns' }]} />

            {/* Hero */}
            <SupportHero
                iconName="rotate-ccw"
                title="Returns & Exchanges"
                subtitle="Satisfaction guaranteed. Easy returns within 30 days."
            />

            {/* Policy Highlights */}
            <section className="py-12 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <PolicyHighlights />
                </div>
            </section>

            {/* Main Content */}
            <div className="py-12 md:py-16 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
                <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-16">
                    {/* Return Process */}
                    <ReturnProcess />

                    {/* Eligibility Checker */}
                    <EligibilityChecker />

                    {/* Return Conditions */}
                    <ReturnConditions />

                    {/* Refund Info */}
                    <RefundInfo />
                </div>
            </div>

            {/* Quick Links */}
            <QuickLinks currentPage="returns" />

            {/* Need Help CTA */}
            <NeedHelpCTA
                title="Need Help with a Return?"
                subtitle="Our support team is ready to assist with any return or exchange questions."
            />

            <Footer />
        </main>
    );
}
