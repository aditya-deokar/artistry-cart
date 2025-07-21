import Providers from '@/Providers';
import './global.css';

export const metadata = {
  title: 'Welcome to Artistry Cart Seller',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
