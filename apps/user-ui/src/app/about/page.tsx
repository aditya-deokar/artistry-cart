/**
 * Artistry Cart - About Page
 * 
 * Our Story - The journey behind Artistry Cart
 * 
 * @see docs/brand/ABOUT_PAGE_BLUEPRINT.md for design specifications
 */

import { Metadata } from 'next';
import Header from '@/shared/widgets/header';
import { Footer } from '@/components/landing';
import {
    AboutHero,
    OriginStory,
    MissionVision,
    CoreValues,
    ImpactMetrics,
    TeamSection,
    ArtisanCommunity,
    Sustainability,
    PressRecognition,
    JoinCTA,
} from '@/components/about';

export const metadata: Metadata = {
    title: 'About Us | Artistry Cart - Our Story & Mission',
    description: 'Discover the story behind Artistry Cart. Learn about our mission to connect creative visionaries with skilled artisans and celebrate authentic craftsmanship worldwide.',
    openGraph: {
        title: 'About Artistry Cart',
        description: 'Where Imagination Meets Craftsmanship - Our Story',
    },
};

export default function AboutPage() {
    return (
        <>
            {/* Navigation */}
            <Header />

            {/* Main Content */}
            <main>
                {/* 1. Hero Statement - Bold opening */}
                <AboutHero />

                {/* 2. Origin Story - Founding narrative */}
                <OriginStory />

                {/* 3. Mission & Vision - Dark manifesto section */}
                <MissionVision />

                {/* 4. Core Values - Brand principles */}
                <CoreValues />

                {/* 5. Impact Metrics - Animated statistics */}
                <ImpactMetrics />

                {/* 6. Team Section - Leadership portraits */}
                <TeamSection />

                {/* 7. Artisan Community - Maker showcase */}
                <ArtisanCommunity />

                {/* 8. Sustainability - Environmental commitment */}
                <Sustainability />

                {/* 9. Press Recognition - Logo wall */}
                <PressRecognition />

                {/* 10. Join CTA - Final call to action */}
                <JoinCTA />
            </main>

            {/* Footer */}
            <Footer />
        </>
    );
}
