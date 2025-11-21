"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Sun, Moon, Users, BarChart2, DollarSign, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface TutorLayoutProps {
  children: React.ReactNode
  title: string
}

export function TutorLayout({ children, title }: TutorLayoutProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [pathname, setPathname] = useState("")
  const [user, setUser] = useState<{ name: string; role: string; email?: string } | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname)
    }
  }, [])

  // --- Tema persistente ---
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

  // --- Lógica de Autenticación con Supabase ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          window.location.href = "/" 
          return
        }

        const userMetadata = session.user.user_metadata;
        const rol = userMetadata?.rol?.toLowerCase();
        
        // PERMISOS: Solo acepta 'tutor' o 'propietario'
        if (rol !== 'tutor' && rol !== 'propietario' && rol !== 'padre') {
          console.warn("⛔ Rol no autorizado para Layout Tutor:", rol);
          toast({ title: "Acceso Denegado", description: `Tu rol (${rol}) no tiene permiso.`, variant: "destructive" })
          window.location.href = "/" 
          return
        }

        // Extraemos el nombre para el header
        setUser({
          name: userMetadata?.nombre || session.user.email || "Tutor Familiar",
          role: rol,
          email: session.user.email
        })
        
      } catch (error) {
        console.error("Error verificando sesión del Tutor:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [toast, router]) 

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("rememberedUser")
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  // Si no hay usuario, ya fue redirigido por el useEffect
  if (!user) return null

  // --- NAVEGACIÓN ORIGINAL ---
  const navItems = [
    { title: "Resumen", icon: Users, href: "/dashboard/tutor" },
    { title: "Asistencias", icon: BarChart2, href: "/dashboard/tutor/asistencias" },
    { title: "Pagos", icon: DollarSign, href: "/dashboard/tutor/pagos" },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header Superior (ESTILO ORIGINAL) */}
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

      {/* Barra de Navegación Inferior (ESTILO ORIGINAL) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50 flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.title} href={item.href}>
              <div
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.title}</span>
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}