"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function DashboardNav() {
  const pathname = usePathname() || "/"

  const items = [
    { href: "/overview", label: "National Overview", icon: "📊" },
    { href: "/mobility", label: "Mobility Analysis", icon: "🗺️" },
    { href: "/state-analytics", label: "State Analytics", icon: "🗺️📍" },
    { href: "/anomalies", label: "Anomalies", icon: "⚠️" },
    { href: "/policy", label: "Policy Recommendations", icon: "📋" },
    { href: "/data-explorer", label: "Data Explorer", icon: "🧾" },
    { href: "/infographic", label: "Infographic", icon: "📈" },
  ]

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between py-3 gap-2">
          <div className="flex items-center gap-2 sm:gap-6">
            <Link href="/" className="text-xl sm:text-2xl font-bold hover:opacity-80 transition-opacity flex items-center gap-2 text-primary tracking-wide">
              Vidyut
            </Link>
            <Button variant="ghost" size="sm" asChild className="hidden lg:flex">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </Button>
          </div>
          <div className="flex gap-0.5 sm:gap-1 overflow-visible flex-nowrap">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-1.5 sm:px-3 py-2 rounded-md text-[10px] sm:text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive(item.href) 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span className="sm:hidden">{item.icon}</span>
                <span className="hidden sm:inline">{item.icon} {item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
