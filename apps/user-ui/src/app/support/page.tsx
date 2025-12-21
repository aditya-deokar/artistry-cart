import { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, Truck, RotateCcw, Mail, ArrowRight, Search } from 'lucide-react';
import { Navigation } from '@/components/navigation/Navigation';
import { Footer } from '@/components/common/Footer';

export const metadata: Metadata = {
    title: 'Support | Artistry Cart - Help Center',
    description: 'Get help with your Artistry Cart orders. Browse FAQs, shipping info, return policies, or contact our support team.',
    openGraph: {
        title: 'Support Center | Artistry Cart',
        description: 'We\'re here to help. Find answers to your questions.',
    },
};

const supportSections = [
    {
        id: 'faq',
        title: 'Frequently Asked Questions',
        description: 'Find quick answers to common questions about orders, shipping, returns, and more.',
        icon: HelpCircle,
        href: '/support/faq',
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
        id: 'shipping',
        title: 'Shipping Information',
        description: 'Learn about shipping options, costs, delivery times, and international shipping.',
        icon: Truck,
        href: '/support/shipping',
        color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    },
    {
        id: 'returns',
        title: 'Returns & Exchanges',
        description: 'Understand our 30-day return policy, how to initiate returns, and refund timelines.',
        icon: RotateCcw,
        href: '/support/returns',
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
        id: 'contact',
        title: 'Contact Us',
        description: 'Get in touch with our support team via live chat, email, or phone.',
        icon: Mail,
        href: '/support/contact',
        color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
];

const popularQuestions = [
    { question: 'How do I track my order?', href: '/support/faq#order-1' },
    { question: 'What is your return policy?', href: '/support/faq#returns-1' },
    { question: 'Do you ship internationally?', href: '/support/faq#shipping-2' },
    { question: 'How do I request a custom order?', href: '/support/faq#products-2' },
];

export default function SupportPage() {
    return (
        <main className="min-h-screen bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)]">
            <Navigation />

            {/* Hero Section */}
            <section className="relative py-20 md:py-28 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-64 h-64 bg-[var(--ac-gold)]/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-[var(--ac-gold)]/3 rounded-full blur-2xl" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-[var(--ac-gold)]/10 dark:bg-[var(--ac-gold)]/15 rounded-full">
                        <HelpCircle className="w-8 h-8 text-[var(--ac-gold)]" />
                    </div>

                    {/* Title */}
                    <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-4">
                        How Can We Help?
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] max-w-2xl mx-auto mb-8">
                        Find answers, get support, and learn about our policies. We&apos;re here for you.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ac-stone)]" />
                        <input
                            type="text"
                            placeholder="Search for help..."
                            className="w-full pl-12 pr-4 py-4 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] placeholder:text-[var(--ac-stone)] focus:outline-none focus:border-[var(--ac-gold)] focus:ring-1 focus:ring-[var(--ac-gold)] transition-colors"
                        />
                    </div>
                </div>
            </section>

            {/* Support Categories */}
            <section className="py-16 md:py-20">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        {supportSections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <Link
                                    key={section.id}
                                    href={section.href}
                                    className="group p-8 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] hover:border-[var(--ac-gold)]/30 transition-all duration-300"
                                >
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${section.color} mb-4`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-2 group-hover:text-[var(--ac-gold)] transition-colors">
                                        {section.title}
                                    </h2>
                                    <p className="text-[var(--ac-graphite)] dark:text-[var(--ac-silver)] mb-4">
                                        {section.description}
                                    </p>
                                    <span className="inline-flex items-center gap-1 text-sm text-[var(--ac-gold)] group-hover:gap-2 transition-all">
                                        Learn more
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Popular Questions */}
            <section className="py-16 md:py-20 bg-[var(--ac-cream)] dark:bg-[var(--ac-onyx)]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] mb-8 text-center">
                        Popular Questions
                    </h2>

                    <div className="space-y-3">
                        {popularQuestions.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="group flex items-center justify-between p-4 bg-[var(--ac-ivory)] dark:bg-[var(--ac-obsidian)] border border-[var(--ac-linen)] dark:border-[var(--ac-slate)] hover:border-[var(--ac-gold)]/30 transition-colors"
                            >
                                <span className="text-[var(--ac-charcoal)] dark:text-[var(--ac-pearl)] group-hover:text-[var(--ac-gold)] transition-colors">
                                    {item.question}
                                </span>
                                <ArrowRight className="w-4 h-4 text-[var(--ac-stone)] group-hover:text-[var(--ac-gold)] group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <Link
                            href="/support/faq"
                            className="inline-flex items-center gap-2 text-[var(--ac-gold)] hover:text-[var(--ac-gold-light)] transition-colors"
                        >
                            View all FAQs
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-16 md:py-20 bg-[var(--ac-charcoal)] dark:bg-[var(--ac-onyx)]">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-[var(--ac-pearl)] mb-4">
                        Still Need Assistance?
                    </h2>
                    <p className="text-[var(--ac-silver)] mb-8 max-w-xl mx-auto">
                        Our support team is available Monday-Friday, 9am-6pm EST. We typically respond within 24 hours.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/support/contact"
                            className="px-8 py-3 bg-[var(--ac-gold)] hover:bg-[var(--ac-gold-light)] text-[var(--ac-obsidian)] text-sm font-medium tracking-wider uppercase transition-colors"
                        >
                            Contact Support
                        </Link>
                        <Link
                            href="/support/contact"
                            className="px-8 py-3 border border-[var(--ac-pearl)]/30 text-[var(--ac-pearl)] hover:border-[var(--ac-pearl)] text-sm font-medium tracking-wider uppercase transition-colors"
                        >
                            Start Live Chat
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
