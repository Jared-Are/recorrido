"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, Sun, Moon, LayoutDashboard, Loader2 } from "lucide-react";
// Importamos Supabase para la verificación
import { supabase } from "@/lib/supabase"; 
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react"

// La función que tenías para obtener la ruta del dashboard
const getDashboardPath = (role: string): string => {
    switch (role.toLowerCase()) {
        case 'propietario':
        case 'admin':
            return "/dashboard/propietario"; // Ruta principal del admin
        case 'tutor':
            return "/dashboard/tutor";
        case 'asistente':
            return "/dashboard/asistente";
        default:
            return "/";
    }
};


export interface MenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
  description?: string;
  color?: string;
  bgColor?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  menuItems: MenuItem[]
}

export function DashboardLayout({ children, title, menuItems }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Almacenamos el nombre y rol real del usuario
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Lógica de Tema (Dejamos tu código original) ---
  useEffect(() => {
    const theme = localStorage.getItem("app-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (theme === "dark" || (!theme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    if (newIsDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem("app-theme", "dark");
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem("app-theme", "light");
    }
  }

  // --- Lógica de Autenticación con Supabase ---
  useEffect(() => {
    const checkAuth = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                // Si no hay sesión, ir al login
                router.push("/");
                return;
            }
            
            const userMetadata = session.user.user_metadata;
            const rol = userMetadata?.rol?.toLowerCase();
            
            // 1. Verificar si el rol es el adecuado para ESTE layout
            if (rol !== 'propietario' && rol !== 'admin') {
                // Si es un tutor o asistente, redirigirlo a su dashboard
                router.push(getDashboardPath(rol)); 
                return;
            }

            // 2. Cargar datos del usuario
            setUser({
                name: userMetadata?.nombre || session.user.email || 'Admin',
                role: rol
            });

        } catch (error) {
            console.error("Error al verificar sesión del Propietario:", error);
            router.push("/");
        } finally {
            setLoading(false);
        }
    };

    checkAuth();
  }, [router]);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("rememberedUser");
    router.push("/");
  }

  if (loading) {
     return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
  }
  
  // Si no se pudo cargar el usuario (o fue redirigido) no renderizamos nada
  if (!user) return null;

  const mainDashboardPath = getDashboardPath(user.role);
  const isSubPage = pathname !== mainDashboardPath;

  return (
    <div className="min-h-screen bg-background text-foreground">
        <header className="bg-card border-b border-border sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-foreground">{title}</h1>
                <p className="text-sm text-muted-foreground">{user.name}</p>
              </div>
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

        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setSidebarOpen(false)} />
              <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.3, type: "tween" }} className="fixed top-0 left-0 h-full w-72 bg-card shadow-lg z-50 flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="font-bold text-lg">Menú</h2>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                      <X className="h-6 w-6" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {menuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link key={item.title} href={item.href} onClick={() => setSidebarOpen(false)}>
                          <div className={`flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors ${item.bgColor}`}>
                            <Icon className={`h-6 w-6 ${item.color} shrink-0`} />
                            <div className="ml-3">
                                <p className="font-medium text-sm text-foreground">{item.title}</p>
                                {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                            </div>
                          </div>
                        </Link>
                      )
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        <main className="flex-1 p-4 md:p-6">
            {isSubPage && (
                <div className="mb-6">
                    <Button variant="outline" size="sm" onClick={() => {
                        console.log('Botón "Volver" presionado. Redirigiendo a:', mainDashboardPath);
                        router.push(mainDashboardPath);
                    }}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Volver al Menú Principal
                    </Button>
                </div>
            )}
            {children}
        </main>
    </div>
  )
}