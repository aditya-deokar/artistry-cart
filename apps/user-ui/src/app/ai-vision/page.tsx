import { AIVisionHero } from '@/components/ai-vision/sections/AIVisionHero';
import { AIGenerator } from '@/components/ai-vision/generator/AIGenerator';
import { VisualSearchShowcase } from '@/components/ai-vision/sections/VisualSearchShowcase';
import { ConceptGallery } from '@/components/ai-vision/sections/ConceptGallery';
import { SuccessStories } from '@/components/ai-vision/sections/SuccessStories';
import { fontVariables } from '@/lib/fonts-ai-vision';
import '@/styles/ai-vision-theme.css';

export const metadata = {
    title: 'AI Vision Studio | Artistry Cart',
    description: 'Describe your vision. See it visualized by AI. Connect with artisans who bring it to life.',
    openGraph: {
        title: 'AI Vision Studio | Artistry Cart',
        description: 'Transform your imagination into reality with AI-powered custom art creation.',
        type: 'website',
    },
};

export default function AIVisionPage() {
    return (
        <main className={fontVariables}>
            {/* Phase 1: Hero Section */}
            <AIVisionHero />

            {/* Phase 2: AI Generator with 3 Modes */}
            <AIGenerator />

            {/* Phase 3: Visual Search Showcase */}
            <VisualSearchShowcase />

            {/* Phase 3: Success Stories (Before/After) */}
            <SuccessStories />

            {/* Phase 3: Concept Gallery with Masonry Layout */}
            <ConceptGallery />

            {/* Phase 4 & 5 sections will be added in future phases */}
        </main>
    );
}
