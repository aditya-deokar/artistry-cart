import AnimatedHeader from '@/components/animations/AnimatedHeader';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
// import Header from '@/shared/widgets/header';



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
   <>
   <AnimatedHeader />
   <Breadcrumbs />
   {children}
   </>
          
          

         
  )
}
