
import './global.css';
import localFont from "next/font/local";
import { ViewTransitions } from "next-view-transitions";
import { Poppins, Raleway, Roboto, Playfair_Display, Cormorant_Garamond, Inter } from "next/font/google"
import Providers from './Providers';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ReactLenis } from 'lenis/react';

import { Toaster } from '@/components/ui/sonner';


export const metadata = {
  title: 'Artistry Cart | Where Imagination Meets Craftsmanship',
  description: 'Discover unique handcrafted creations by master artisans, or bring your vision to life with AI-powered custom orders.',
}

// Premium Luxury Fonts
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

// Legacy Fonts (keeping for backward compatibility)
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-roboto",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
})

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
});

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
        <body className={`${playfair.variable} ${cormorant.variable} ${inter.variable} ${roboto.variable} ${poppins.variable} ${raleway.variable} ${gambarino.variable} antialiased`} suppressHydrationWarning>

          <ReactLenis
            root
            options={{
              lerp: 0.1,           // Lower = smoother (0.05-0.15 recommended)
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
