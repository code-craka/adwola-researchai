'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Use a state to track whether we're mounted on the client
  const [mounted, setMounted] = React.useState(false)

  // After mounting, we have access to the window object
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Return early with no theme applied before client-side hydration
  // This prevents hydration mismatch between server and client
  if (!mounted) {
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
