'use client';

import { useState } from 'react';
import { Bounded } from '@/components/common/Bounded';
import TextToImageGenerator from './generators/TextToImageGenerator';
import ExploreTab from './ExploreTab';
import MyConceptsTab from './MyConceptsTab';
import FilterSidebar from './FilterSidebar';
import { Sparkles } from 'lucide-react';

type Tab = 'generate' | 'explore' | 'my-concepts';

interface TabNavLinkProps {
  href: string;
  isActive: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

const TabNavLink: React.FC<TabNavLinkProps> = ({ isActive, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative w-full px-4 py-3 text-left transition-all duration-300 ease-out rounded-lg
        ${
          isActive
            ? 'bg-gradient-to-r from-[var(--ac-gold)]/10 to-transparent text-[var(--ac-gold)] font-medium'
            : 'text-[var(--ac-text)]/70 dark:text-[var(--ac-pearl)]/70 hover:text-[var(--ac-text)] dark:hover:text-[var(--ac-pearl)] hover:bg-[var(--ac-cream)]/5 dark:hover:bg-[var(--ac-slate)]/20'
        }
      `}
    >
      <span className="relative z-10">{children}</span>
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--ac-gold)] rounded-r-full" />
      )}
    </button>
  );
};

export default function AIVisionDiscovery() {
  const [activeTab, setActiveTab] = useState<Tab>('generate');

  const handleTabChange = (tab: Tab) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab(tab);
  };

  return (
    <Bounded className="relative py-16 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--ac-gold)] rounded-full blur-3xl opacity-[0.03]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--ac-gold)] rounded-full blur-3xl opacity-[0.02]" />
        <div className="absolute top-1/2 left-0 w-px h-64 bg-gradient-to-b from-transparent via-[var(--ac-gold)]/20 to-transparent" />
        <div className="absolute top-1/2 right-0 w-px h-64 bg-gradient-to-b from-transparent via-[var(--ac-gold)]/20 to-transparent" />
      </div>

      {/* Header */}
      <div className="mb-12 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[var(--ac-gold)]">
          AI Studio
        </p>
        <h1
          className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--ac-text)] dark:text-[var(--ac-pearl)]"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Transform Ideas Into Reality
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-[var(--ac-text)]/70 dark:text-[var(--ac-silver)]">
          Generate unique artisan product concepts using AI-powered creativity
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="relative rounded-2xl border border-[var(--ac-text)]/10 dark:border-[var(--ac-text)]/20 bg-white/50 dark:bg-[var(--ac-onyx)]/50 backdrop-blur-sm p-6 shadow-sm">
            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-50">
              <div className="absolute top-4 right-4 w-12 h-px bg-gradient-to-l from-[var(--ac-gold)] to-transparent" />
              <div className="absolute top-4 right-4 w-px h-12 bg-gradient-to-t from-[var(--ac-gold)] to-transparent" />
            </div>

            {/* AI Studio Branding */}
            <div className="mb-8 pb-6 border-b border-[var(--ac-text)]/10 dark:border-[var(--ac-text)]/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[var(--ac-gold)]/20 to-[var(--ac-gold)]/5">
                  <Sparkles className="w-5 h-5 text-[var(--ac-gold)]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--ac-text)] dark:text-[var(--ac-pearl)]">AI Studio</h3>
                  <p className="text-xs text-[var(--ac-text)]/50 dark:text-[var(--ac-text)]/60">Powered by Gemini</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 mb-8">
              <TabNavLink
                href="#generate"
                isActive={activeTab === 'generate'}
                onClick={handleTabChange('generate')}
              >
                Generate
              </TabNavLink>
              <TabNavLink
                href="#explore"
                isActive={activeTab === 'explore'}
                onClick={handleTabChange('explore')}
              >
                Explore Gallery
              </TabNavLink>
              <TabNavLink
                href="#my-concepts"
                isActive={activeTab === 'my-concepts'}
                onClick={handleTabChange('my-concepts')}
              >
                My Concepts
              </TabNavLink>
            </nav>

            {/* Filters */}
            {(activeTab === 'explore' || activeTab === 'my-concepts') && (
              <div className="pt-6 border-t border-[var(--ac-text)]/10 dark:border-[var(--ac-text)]/20">
                <FilterSidebar activeTab={activeTab} />
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="relative rounded-2xl border border-[var(--ac-text)]/10 dark:border-[var(--ac-text)]/20 bg-white/50 dark:bg-[var(--ac-onyx)]/50 backdrop-blur-sm p-8 shadow-sm min-h-[600px]">
            {/* Tab Content */}
            {activeTab === 'generate' && <TextToImageGenerator />}
            {activeTab === 'explore' && <ExploreTab />}
            {activeTab === 'my-concepts' && <MyConceptsTab />}
          </div>
        </div>
      </div>
    </Bounded>
  );
}
