import { Metadata } from 'next';
import { Navigation } from '@/components/navigation/Navigation';
import { Footer } from '@/components/landing/Footer';
import {
    SupportHero,
    SupportBreadcrumb,
    NeedHelpCTA,
    QuickLinks,
    ShippingTable,
    ShippingTimeline,
    InternationalInfo,
    ShippingCalculator,
    SpecialNotes,
} from '@/components/support';

export const metadata: Metadata = {
    title: 'Shipping Information | Artistry Cart',
    description: 'Learn about shipping options, costs, and delivery times for Artistry Cart orders. Free shipping on orders over $99.',
    openGraph: {
        title: 'Shipping Information | Artistry Cart',
        description: 'Fast, reliable shipping for handcrafted treasures.',
    },
};

export default function ShippingPage() {
    return (
        <main className="min-h-screen bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
            <Navigation />

            {/* Breadcrumb */}
            <SupportBreadcrumb items={[{ label: 'Shipping' }]} />

            {/* Hero */}
            <SupportHero
                iconName="truck"
                title="Shipping Information"
                subtitle="Delivering handcrafted treasures to your doorstep with care and precision."
            />

            {/* Main Content */}
            <div className="py-12 md:py-16 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
                <div className="max-w-6xl mx-auto px-6 lg:px-8 space-y-16">
                    {/* Shipping Options Table */}
                    <ShippingTable />

                    {/* Shipping Timeline */}
                    <ShippingTimeline />

                    {/* Shipping Calculator */}
                    <ShippingCalculator />

                    {/* International Shipping */}
                    <InternationalInfo />

                    {/* Special Notes */}
                    <SpecialNotes />
                </div>
            </div>

            {/* Quick Links */}
            <QuickLinks currentPage="shipping" />

            {/* Need Help CTA */}
            <NeedHelpCTA
                title="Questions About Shipping?"
                subtitle="Our team is here to help with any shipping inquiries or special delivery requests."
            />

            <Footer />
        </main>
    );
}
