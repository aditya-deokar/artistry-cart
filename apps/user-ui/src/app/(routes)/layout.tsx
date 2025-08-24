import { Breadcrumbs } from '@/components/common/Breadcrumbs';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
   <>
   
   <Breadcrumbs />
   {children}
   </>
          
          

         
  )
}
