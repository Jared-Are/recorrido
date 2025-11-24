"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Sun, Moon, Users, CalendarCheck, BarChart3 } from "lucide-react"
import { supabase } from "@/lib/supabase" 
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
// 👇 1. IMPORTAR LA CAMPANA
import { NotificationsBell } from "@/components/notifications-bell"

interface AsistenteLayoutProps {
  children: React.ReactNode
  title: string
}

export function AsistenteLayout({ children, title }: AsistenteLayoutProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [pathname, setPathname] = useState("")
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname)
    }
  }, [])

  // 1. Lógica de Tema
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

  // 2. Lógica de Autenticación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push("/login")
          return
        }

        const rol = session.user.user_metadata?.rol?.toLowerCase()
        if (rol !== 'asistente' && rol !== 'propietario' && rol !== 'chofer') {
          toast({ title: "Acceso denegado", description: "No tienes permiso de asistente", variant: "destructive" })
          router.push("/login")
          return
        }

        setUser({
          name: session.user.user_metadata?.nombre || "Personal",
          role: "Asistente de Ruta"
        })
        
      } catch (error) {
        console.error("Error auth:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [toast, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("rememberedUser")
    router.push("/login") 
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        Cargando...
      </div>
    )
  }

  if (!user && !loading) return null

  const navItems = [
    { title: "Resumen", icon: Users, href: "/dashboard/asistente" },
    { title: "Asistencia", icon: CalendarCheck, href: "/dashboard/asistente/asistencia" },
    { title: "Historial", icon: BarChart3, href: "/dashboard/asistente/historial" },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          
          {/* Izquierda: Título y Nombre */}
          <div>
             <h1 className="text-lg font-bold text-foreground leading-none">{title}</h1>
             <p className="text-xs text-muted-foreground mt-1">{user?.name}</p>
          </div>

          {/* Derecha: Acciones */}
          <div className="flex items-center gap-2">
            
            {/* 👇 2. ¡AHORA SÍ! LA CAMPANA ESTÁ AQUÍ */}
            <NotificationsBell />

            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Button size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 pb-24">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50 flex justify-around items-center pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.title} href={item.href} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all ${isActive ? "text-primary scale-105 font-medium" : "text-muted-foreground"}`}>
                <item.icon className={`h-6 w-6 ${isActive ? "fill-current/20" : ""}`} />
                <span className="text-[10px]">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}