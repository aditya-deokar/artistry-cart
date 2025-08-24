
import './global.css';
import localFont from "next/font/local";
import { ViewTransitions } from "next-view-transitions";
import { Poppins, Raleway, Roboto} from "next/font/google"
import Providers from './Providers';
import { ThemeProvider } from '@/components/theme/theme-provider';

import ReactLenis from "lenis/react";
import Header from '@/shared/widgets/header';
import { Toaster } from '@/components/ui/sonner';


export const metadata = {
  title: 'Artistry Cart',
  description: 'Art Products',
}

const roboto = Roboto({
  subsets: ["latin"],
  weight:["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable:"--font-roboto",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight:["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable:"--font-poppins",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning> 
        <body className={`${roboto.variable} ${poppins.variable} ${raleway.variable} ${gambarino.variable} antialiased`} suppressHydrationWarning>
           <ReactLenis root options={{ lerp: 0.05, smoothWheel: true }} >

            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
            <Providers>
              <Toaster position='top-center'/>
              <Header />
            {children}

            </Providers>
            </ThemeProvider>
          </ReactLenis>
        </body>
      </html>
    </ViewTransitions>
  )
}
