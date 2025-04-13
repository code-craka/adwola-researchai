"use client"

import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"
import type { ReactNode } from "react"

interface NextAuthSessionProviderProps {
  children: ReactNode
  session?: Session | null
}

const NextAuthSessionProvider = ({ children, session }: NextAuthSessionProviderProps) => {
  return <SessionProvider session={session}>{children}</SessionProvider>
}

export default NextAuthSessionProvider
