
import './global.css';

import Providers from './Providers';
import { ThemeProvider } from '@/shared/provider/theme-provider';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: 'Artistry Cart: Seller',
  description: 'Art Products',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning> 
      <body className="antialiased" suppressHydrationWarning>
         <ThemeProvider
        attribute={'class'}
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
        >
        <Providers>
          {children}
          <Toaster position='top-center'/>
        </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
