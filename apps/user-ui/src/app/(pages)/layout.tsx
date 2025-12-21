
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Navigation } from '@/components/navigation';

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navigation transparent={false} hideOnScroll />
      <Breadcrumbs />
      {children}
    </>
  )
}
