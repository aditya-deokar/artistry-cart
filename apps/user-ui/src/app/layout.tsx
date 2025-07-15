import Header from '@/shared/widgets/header';
import './global.css';

import { Poppins, Roboto} from "next/font/google"

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en"> 
      <body className={`${roboto.variable} ${poppins.variable}`}>

        <Header/>
        {children}
      
      </body>
    </html>
  )
}
