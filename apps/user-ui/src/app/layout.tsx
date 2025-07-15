import './global.css';

export const metadata = {
  title: 'Artistry Cart',
  description: 'Art Products',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
