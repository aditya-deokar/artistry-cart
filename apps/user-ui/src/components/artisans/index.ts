/**
 * Artistry Cart - Artisans Page Components
 * 
 * Discovery platform for exploring artisan makers worldwide.
 * Built following the ARTISANS_PAGE_BLUEPRINT.md specifications.
 * 
 * Design Inspiration: Behance, Etsy, Dribbble, 1stDibs, Artsy
 * Technologies: GSAP, ScrollTrigger, nuqs
 */

// Core Sections
export { ArtisansHero } from './ArtisansHero';
export { ArtisanFilters } from './ArtisanFilters';
export { ArtisanCard } from './ArtisanCard';
export { ArtisanGrid } from './ArtisanGrid';
export { ArtisanSearch } from './ArtisanSearch';

// Feature Sections (Phase 2+)
export { FeaturedArtisans } from './FeaturedArtisans';
export { CraftCategories } from './CraftCategories';
export { ArtisanStories } from './ArtisanStories';
export { BecomeArtisanCTA } from './BecomeArtisanCTA';
export { ArtisanMapExplorer } from './ArtisanMapExplorer';

// UI Components
export { ActiveFilterChips } from './ActiveFilterChips';
export { MobileFilterDrawer } from './MobileFilterDrawer';

// Filter options (for external use)
export {
    categoryOptions,
    locationOptions,
    ratingOptions,
    sortOptions,
} from './ArtisanFilters';

// Profile Page Components
export * from './profile';
