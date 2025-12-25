import {
    Playfair_Display,
    Cormorant_Garamond,
    Inter,
    Space_Mono
} from 'next/font/google';

// Display Font - Headlines and Hero Text
export const playfair = Playfair_Display({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-playfair',
    display: 'swap',
    preload: true,
    fallback: ['Georgia', 'serif'],
});

// Heading Font - Subheadings and Section Titles
export const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-cormorant',
    display: 'swap',
    preload: true,
    fallback: ['Georgia', 'serif'],
});

// Body Font - Body Text and UI Elements
export const inter = Inter({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600'],
    variable: '--font-inter',
    display: 'swap',
    preload: true,
    fallback: ['system-ui', 'sans-serif'],
});

// Accent Font - Labels and Special Text
export const spaceMono = Space_Mono({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-space-mono',
    display: 'swap',
    preload: true,
    fallback: ['monospace'],
});

// Combined class names for root layout
export const fontVariables = `
  ${playfair.variable} 
  ${cormorant.variable} 
  ${inter.variable} 
  ${spaceMono.variable}
`.trim();
