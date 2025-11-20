"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Sun, Moon, Users, CalendarCheck, BarChart3 } from "lucide-react"
import { supabase } from "@/lib/supabase" // <--- Usamos Supabase
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface AsistenteLayoutProps {
  children: React.ReactNode
  title: string
}

export function AsistenteLayout({ children, title }: AsistenteLayoutProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  // Estado para la ruta actual (para marcar el activo en el menú)
  const [pathname, setPathname] = useState("")
  
  // Estado del usuario (Adaptado para Supabase)
  const [user, setUser] = useState<{ name: string; email?: string } | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname)
    }
  }, [])

  // 1. Lógica de Tema (Original tuya)
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

  // 2. Lógica de Autenticación (Adaptada a Supabase)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          window.location.href = "/login"
          return
        }

        // Validamos rol (para que no entre un padre aquí)
        const rol = session.user.user_metadata?.rol?.toLowerCase()
        if (rol !== 'asistente' && rol !== 'propietario') {
          toast({ title: "Acceso denegado", description: "No tienes permiso de asistente", variant: "destructive" })
          window.location.href = "/login"
          return
        }

        // Extraemos el nombre para mostrarlo en el header
        setUser({
          name: session.user.user_metadata?.nombre || session.user.email || "Asistente",
          email: session.user.email
        })
        
      } catch (error) {
        console.error("Error auth:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [toast])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("rememberedUser") // Opcional, si quieres olvidar el "Recordarme"
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        Cargando...
      </div>
    )
  }

  // Si no hay usuario y ya cargó, no mostramos nada (el useEffect redirige)
  if (!user && !loading) return null

  const navItems = [
    { title: "Resumen", icon: Users, href: "/dashboard/asistente" },
    { title: "Asistencia", icon: CalendarCheck, href: "/dashboard/asistente/asistencia" },
    { title: "Historial", icon: BarChart3, href: "/dashboard/asistente/historial" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Superior */}
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

      {/* Contenido Principal */}
      <main className="flex-1 p-4 md:p-6 pb-20">{children}</main>

      {/* Barra de Navegación Inferior (Tu diseño original) */}
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