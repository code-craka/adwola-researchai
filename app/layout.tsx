import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import NextAuthSessionProvider from "@/components/session-provider"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import "@/lib/init" // Import initialization code for environment variable validation

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Adwola Research AI",
  description: "Transform your research papers with AI",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <NextAuthSessionProvider>
            {children}
            <Toaster />
          </NextAuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
