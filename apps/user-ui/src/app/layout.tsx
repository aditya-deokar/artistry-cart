
import './global.css';
import localFont from "next/font/local";
import { ViewTransitions } from "next-view-transitions";
import Providers from './Providers';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ReactLenis } from 'lenis/react';

import { Toaster } from '@/components/ui/sonner';


export const metadata = {
  title: 'Artistry Cart | Where Imagination Meets Craftsmanship',
  description: 'Discover unique handcrafted creations by master artisans, or bring your vision to life with AI-powered custom orders.',
}

const gambarino = localFont({
  src: "./gambarino.woff2",
  display: "swap",
  variable: "--font-gambarino",
});

// ... (other imports)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body className={`${gambarino.variable} antialiased`} suppressHydrationWarning>

          <ReactLenis
            root
            options={{
              lerp: 0.05,           // Lower = smoother (0.05-0.15 recommended)
              duration: 1.2,       // Scroll animation duration
              smoothWheel: true,   // Enable smooth wheel scrolling
              wheelMultiplier: 1,  // Wheel scroll speed
              touchMultiplier: 2,  // Touch scroll speed
              infinite: false,     // No infinite scroll
            }}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Providers>
                <Toaster position='top-center' />

                {children}
              </Providers>
            </ThemeProvider>
          </ReactLenis>

        </body>
      </html>
    </ViewTransitions>
  )
}
