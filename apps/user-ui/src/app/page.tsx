/**
 * Artistry Cart - Landing Page
 * 
 * Premium creative ecommerce platform landing page.
 * Where Imagination Meets Craftsmanship.
 * 
 * @see docs/brand/LANDING_PAGE_BLUEPRINT.md for design specifications
 */

import { Navigation } from '@/components/navigation';
import {
  Hero,
  Manifesto,
  FeaturedCategories,
  CuratedCollection,
  AIVisionTeaser,
  ArtisanSpotlight,
  Testimonials,
  Philosophy,
  FinalCTA,
  Footer,
} from '@/components/landing';

export default function HomePage() {
  return (
    <>
      {/* Premium Navigation - Transparent with floating pill */}
      <Navigation transparent hideOnScroll />

      {/* Main Content */}
      <main>
        {/* 1. Hero - Full-viewport cinematic introduction */}
        <Hero />

        {/* 2. Manifesto - Scroll-reveal brand philosophy */}
        <Manifesto />

        {/* 3. Featured Categories - Three large category cards */}
        <FeaturedCategories />

        {/* 4. Curated Collection - Editorial product showcase */}
        <CuratedCollection />

        {/* 5. AI Vision Teaser - Unique feature showcase (dark section) */}
        <AIVisionTeaser />

        {/* 6. Artisan Spotlight - Featured artist story */}
        <ArtisanSpotlight />

        {/* 7. Testimonials - Customer testimonials carousel */}
        <Testimonials />

        {/* 8. Philosophy - Brand values */}
        <Philosophy />

        {/* 9. Final CTA - Final call to action */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
