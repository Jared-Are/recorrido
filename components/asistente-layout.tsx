"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Sun, Moon, Users, CalendarCheck, BarChart3 } from "lucide-react"
import type { User } from "@/lib/auth"

interface AsistenteLayoutProps {
  children: React.ReactNode
  title: string
}

export function AsistenteLayout({ children, title }: AsistenteLayoutProps) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : ""
  const [user, setUser] = useState<User | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const theme = localStorage.getItem("app-theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (theme === "dark" || (!theme && prefersDark)) {
      document.documentElement.classList.add("dark")
      setIsDarkMode(true)
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode
    setIsDarkMode(newIsDarkMode)
    if (newIsDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("app-theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("app-theme", "light")
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (!storedUser) {
      window.location.href = "/"
    } else {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    window.location.href = "/"
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        Cargando...
      </div>
    )
  }

  const navItems = [
    { title: "Resumen", icon: Users, href: "/dashboard/asistente" },
    { title: "Asistencia", icon: CalendarCheck, href: "/dashboard/asistente/asistencia" },
    { title: "Historial", icon: BarChart3, href: "/dashboard/asistente/historial" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div>
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{user?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50 flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <a key={item.title} href={item.href}>
              <div
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.title}</span>
              </div>
            </a>
          )
        })}
      </nav>
    </div>
  )
}
