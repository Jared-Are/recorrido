"use client"

import type React from "react"
import { useState, useEffect } from "react"
// Importamos RequestInit para tipar la opción de fetch
import type { RequestInit } from "next/dist/server/web/spec-extension/request"
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
    Plus, 
    Users, 
    DollarSign, 
    Bus, 
    UserCog, 
    Bell, 
    BarChart3, 
    TrendingDown,
    Loader2,
    Pencil,  // <-- 1. Importar icono de Editar
    Trash2   // <-- 2. Importar icono de Eliminar
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

// --- TIPO ACTUALIZADO (Coincide con aviso.entity.ts) ---
export type Aviso = {
  id: string;
  titulo: string;
  contenido: string; 
  destinatario: 'todos' | 'tutores' | 'personal'; 
  fechaCreacion: string; 
};

// --- DEFINICIÓN DEL MENÚ (Sin cambios) ---
const menuItems: MenuItem[] = [
  {
    title: "Gestionar Alumnos",
    description: "Ver y administrar estudiantes",
    icon: Users,
    href: "/dashboard/propietario/alumnos",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "Gestionar Pagos",
    description: "Ver historial y registrar pagos",
    icon: DollarSign,
    href: "/dashboard/propietario/pagos",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    title: "Gestionar Gastos",
    description: "Control de combustible, salarios, etc.",
    icon: TrendingDown,
    href: "/dashboard/propietario/gastos",
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
  },
  {
    title: "Gestionar Personal",
    description: "Administrar empleados y choferes",
    icon: Users,
    href: "/dashboard/propietario/personal",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    title: "Gestionar Vehículos",
    description: "Administrar flota de vehículos",
    icon: Bus,
    href: "/dashboard/propietario/vehiculos",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    title: "Gestionar Usuarios",
    description: "Administrar accesos al sistema",
    icon: UserCog,
    href: "/dashboard/propietario/usuarios",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    title: "Enviar Avisos",
    description: "Comunicados a tutores y personal",
    icon: Bell,
    href: "/dashboard/propietario/avisos",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  {
    title: "Generar Reportes",
    description: "Estadísticas y análisis",
    icon: BarChart3,
    href: "/dashboard/propietario/reportes",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
];

export default function AvisosPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // --- Cargar Avisos desde la API (Sin cambios) ---
  useEffect(() => {
    const fetchAvisos = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avisos`);
        
        if (!response.ok) {
          throw new Error("No se pudo obtener la lista de avisos");
        }
        
        const data: Aviso[] = await response.json();
        setAvisos(data);

      } catch (err: any) {
        toast({
          title: "Error al cargar avisos",
          description: (err as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAvisos();
  }, [toast]);


  // --- 3. Lógica para Eliminar (Adaptada de VehiculosPage) ---
  const handleEliminarAviso = async (id: string) => {
    const aviso = avisos.find(a => a.id === id);
    if (!aviso) return;

    // Confirmación
    const confirmMessage = `¿Estás seguro de ELIMINAR PERMANENTEMENTE el aviso "${aviso.titulo}"? Esta acción no se puede deshacer.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const requestOptions: RequestInit = {
        method: 'DELETE',
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/avisos/${id}`, 
        requestOptions
      );

      if (!response.ok) {
        // Tu backend (AvisosService > remove) no tiene control de FK,
        // pero sí podría fallar por otros motivos.
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || "No se pudo eliminar el aviso.");
      }
      
      // Actualizar el estado local
      setAvisos(prev => prev.filter(a => a.id !== id)); 

      toast({
        title: "Acción completada",
        description: `Aviso "${aviso.titulo}" eliminado permanentemente.`,
      });

    } catch (err: any) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  }

  return (
    <DashboardLayout title="Gestión de Avisos" menuItems={menuItems}>
      <div className="space-y-6">
        <div className="flex justify-end">
            <Link href="/dashboard/propietario/avisos/nuevo">
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Aviso
                </Button>
            </Link>
        </div>

        {/* --- ESTADOS DE CARGA Y VACÍO (Sin cambios) --- */}
        {loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-3 text-muted-foreground">Cargando avisos...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && avisos.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <p className="text-muted-foreground">No hay avisos para mostrar.</p>
                <p className="text-sm text-muted-foreground">¡Crea uno nuevo para empezar!</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* --- LISTA DE AVISOS (Renderizado corregido) --- */}
        {!loading && avisos.length > 0 && (
          <div className="grid gap-4">
            {avisos.map((aviso) => (
              <Card key={aviso.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    {/* Lado Izquierdo: Título y Fecha */}
                    <div>
                      <CardTitle className="text-lg">{aviso.titulo}</CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(aviso.fechaCreacion).toLocaleDateString("es-NI", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </CardDescription>
                    </div>

                    {/* --- 4. Lado Derecho: Destinatario y Botones de Acción --- */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">
                        Para: {aviso.destinatario?.toUpperCase() || "TODOS"}
                      </div>
                      
                      {/* Botones de Acción */}
                      <div className="flex gap-1">
                        <Link href={`/dashboard/propietario/avisos/${aviso.id}`}>
                          <Button variant="ghost" size="icon" title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Eliminar"
                          onClick={() => handleEliminarAviso(aviso.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground whitespace-pre-line">
                    {aviso.contenido}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}