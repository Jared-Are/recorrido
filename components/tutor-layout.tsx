"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Sun, Moon, Users, BarChart2, DollarSign, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
// 👇 1. IMPORTAR LA CAMPANA
import { NotificationsBell } from "@/components/notifications-bell"

interface TutorLayoutProps {
  children: React.ReactNode
  title: string
}

export function TutorLayout({ children, title }: TutorLayoutProps) {
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

  // --- Lógica de Autenticación ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push("/login")
          return
        }

        const userMetadata = session.user.user_metadata;
        const rol = userMetadata?.rol?.toLowerCase();
        
        if (rol !== 'tutor' && rol !== 'propietario' && rol !== 'padre') {
          router.push("/login")
          return
        }

        setUser({
          name: userMetadata?.nombre || "Tutor Familiar",
          role: rol === 'propietario' ? 'Administrador' : 'Tutor Familiar',
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  const navItems = [
    { title: "Resumen", icon: Users, href: "/dashboard/tutor" },
    { title: "Asistencias", icon: BarChart2, href: "/dashboard/tutor/asistencias" },
    { title: "Pagos", icon: DollarSign, href: "/dashboard/tutor/pagos" },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          
          {/* Izquierda: Título y Nombre (Estilo Admin) */}
          <div>
             <h1 className="text-lg font-bold text-foreground leading-none">{title}</h1>
             <p className="text-xs text-muted-foreground mt-1">{user?.name}</p>
          </div>

          {/* Derecha: Acciones (Estilo Admin) */}
          <div className="flex items-center gap-2">
            
            {/* 👇 2. CAMPANA AGREGADA AQUÍ */}
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