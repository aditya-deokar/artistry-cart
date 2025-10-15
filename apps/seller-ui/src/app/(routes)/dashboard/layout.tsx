import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/shared/sidebar/app-sidebar'
import { DashboardHeader } from '@/shared/sidebar/dashboard-header'
import React from 'react'

const Layout = ({children}:{children: React.ReactNode}) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 space-y-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Layout