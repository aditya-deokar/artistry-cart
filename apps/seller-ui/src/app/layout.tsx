
import './global.css';

import { Poppins, Roboto} from "next/font/google"
import Providers from './Providers';
import { ThemeProvider } from '@/shared/provider/theme-provider';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: 'Artistry Cart: Seller',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning> 
      <body className={`${roboto.variable} ${poppins.variable}`} suppressHydrationWarning>
         <ThemeProvider
        attribute={'class'}
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
        >
        <Providers>
          {children}
          <Toaster/>
        </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
