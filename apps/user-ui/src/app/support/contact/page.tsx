import { Metadata } from 'next';
import { Navigation } from '@/components/navigation/Navigation';
import { Footer } from '@/components/landing/Footer';
import {
    SupportHero,
    SupportBreadcrumb,
    QuickLinks,
    ContactOptions,
    ContactForm,
    ResponseInfo,
    OfficeLocation,
} from '@/components/support';

export const metadata: Metadata = {
    title: 'Contact Us | Artistry Cart Support',
    description: 'Get in touch with Artistry Cart support. Live chat, email, or phone—we\'re here to help with your orders and questions.',
    openGraph: {
        title: 'Contact Artistry Cart',
        description: 'Reach out to our friendly support team.',
    },
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
            <Navigation />

            {/* Breadcrumb */}
            <SupportBreadcrumb items={[{ label: 'Contact' }]} />

            {/* Hero */}
            <SupportHero
                iconName="mail"
                title="Get in Touch"
                subtitle="We're here to help. Reach out anytime."
            />

            {/* Contact Options */}
            <section className="py-12 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <ContactOptions />
                </div>
            </section>

            {/* Form & Response Info */}
            <section className="py-12 md:py-16 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2">
                            <ContactForm />
                        </div>
                        <div>
                            <ResponseInfo />
                        </div>
                    </div>
                </div>
            </section>

            {/* Office Location */}
            <section className="py-12 md:py-16 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <OfficeLocation />
                </div>
            </section>

            {/* Quick Links */}
            <QuickLinks currentPage="contact" />

            <Footer />
        </main>
    );
}
