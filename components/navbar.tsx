"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bot, Menu, X } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const navLinks = [
    { href: "/features", label: "Features" },
    { href: "/how-it-works", label: "How it Works" },
    { href: "/demo", label: "Demo" },
    { href: "/examples", label: "Examples" },
    { href: "/pricing", label: "Pricing" },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-lg border-b border-white/10" : "bg-transparent"
      }`}
    >
      <Link href="/" className="flex items-center space-x-2">
        <Bot className="w-8 h-8 text-purple-500" />
        <span className="text-white font-medium text-xl">Adwola ResearchAI</span>
      </Link>

      <div className="hidden md:flex items-center space-x-8">
        {navLinks.map((link) => (
          <NavLink key={link.href} href={link.href} active={pathname === link.href}>
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="hidden md:flex items-center space-x-4">
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
                  <AvatarFallback className="bg-purple-700">{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {session.user?.name && <p className="font-medium">{session.user.name}</p>}
                  {session.user?.email && (
                    <p className="w-[200px] truncate text-sm text-gray-500">{session.user.email}</p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/projects">My Projects</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/api/auth/signout">Sign out</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button variant="ghost" className="text-white hover:text-purple-400" onClick={() => signIn()}>
              Sign In
            </Button>
            <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
              <Link href="/login">Get Started</Link>
            </Button>
          </>
        )}
      </div>

      <Button variant="ghost" size="icon" className="md:hidden text-white" onClick={toggleMobileMenu}>
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-black/95 flex flex-col items-center pt-8">
          <div className="flex flex-col items-center space-y-6 w-full px-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg ${
                  pathname === link.href ? "text-purple-400 font-medium" : "text-gray-300"
                } hover:text-white transition-colors w-full text-center py-2`}
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-800 w-full my-4"></div>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-lg text-gray-300 hover:text-white transition-colors w-full text-center py-2"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <Link
                  href="/projects"
                  className="text-lg text-gray-300 hover:text-white transition-colors w-full text-center py-2"
                  onClick={closeMobileMenu}
                >
                  My Projects
                </Link>
                <Link
                  href="/api/auth/signout"
                  className="text-lg text-gray-300 hover:text-white transition-colors w-full text-center py-2"
                  onClick={closeMobileMenu}
                >
                  Sign Out
                </Link>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-lg text-gray-300 hover:text-white w-full"
                  onClick={() => {
                    signIn()
                    closeMobileMenu()
                  }}
                >
                  Sign In
                </Button>
                <Button
                  asChild
                  className="bg-purple-600 hover:bg-purple-700 text-white w-full mt-2"
                  onClick={closeMobileMenu}
                >
                  <Link href="/login">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </motion.nav>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-gray-300 hover:text-white transition-colors relative group">
      <span className={active ? "text-purple-400 font-medium" : ""}>{children}</span>
      <span
        className={`absolute -bottom-1 left-0 h-0.5 bg-purple-500 transition-all ${
          active ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </Link>
  )
}
