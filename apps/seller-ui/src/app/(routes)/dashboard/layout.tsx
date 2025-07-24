import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/shared/sidebar/app-sidebar'
import React from 'react'

const Layout = ({children}:{children: React.ReactNode}) => {
  return (
    <SidebarProvider>
      <AppSidebar
       
      />
      <SidebarInset>
        
        <div className="p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Layout