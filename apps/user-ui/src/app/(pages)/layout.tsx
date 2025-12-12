
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import Header from '@/shared/widgets/header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
   <>
   <Header />
   <Breadcrumbs />
   {children}
   </>
          
          

         
  )
}
