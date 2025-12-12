"use client"
import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { LocationProvider } from '@/context/LocationContext'

const Providers = ({ children }: { children: React.ReactNode }) => {

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
      },
    }
  }))
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <LocationProvider>
          {children}
        </LocationProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  )
}

export default Providers