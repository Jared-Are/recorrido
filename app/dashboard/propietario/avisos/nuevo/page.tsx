"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
    Send, 
    Users, 
    DollarSign, 
    Bus, 
    UserCog, 
    Bell, 
    BarChart3, 
    TrendingDown, 
    ArrowLeft,
    Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

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

type DestinatarioTipo = "tutores" | "personal";

export default function NuevoAvisoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  // --- CAMBIO DE ESTADO (mensaje -> contenido) ---
  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "", // <--- CAMBIADO
    destinatarios: [] as DestinatarioTipo[], 
  })

  // --- FUNCIÓN DE ENVÍO (CONECTADA A LA API) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // El DTO no permite un array vacío, pero el formulario sí.
    // Dejamos que el DTO (backend) use su valor 'default' si no se marca nada.
    
    setLoading(true)

    // --- LÓGICA DE ADAPTACIÓN ---
    // El backend espera UN solo string ('tutores', 'personal', o 'todos')
    // El frontend usa un array (['tutores', 'personal'])
    // Necesitamos "traducir" del frontend al backend.
    
    let destinatario: 'todos' | 'tutores' | 'personal' | undefined = undefined;
    const hasTutores = formData.destinatarios.includes('tutores');
    const hasPersonal = formData.destinatarios.includes('personal');

    if (hasTutores && hasPersonal) {
        destinatario = 'todos';
    } else if (hasTutores) {
        destinatario = 'tutores';
    } else if (hasPersonal) {
        destinatario = 'personal';
    }
    // Si es 'undefined', el backend DTO es 'opcional' y usará el 'default' de la entidad.

    // --- PAYLOAD CORREGIDO ---
    // Esto coincide EXACTAMENTE con tu CreateAvisoDto
    const payload = {
      titulo: formData.titulo,
      contenido: formData.contenido, // <--- CAMBIADO
      destinatario: destinatario,      // <--- CAMBIADO
      // No enviamos 'fecha', el backend lo maneja
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avisos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Capturamos el error de validación de NestJS
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message.toString() || "No se pudo enviar el aviso");
      }

      toast({
        title: "Aviso enviado",
        description: `El aviso ha sido enviado.`,
      })

      router.push("/dashboard/propietario/avisos")

    } catch (err: any) {
      toast({
        title: "Error al enviar",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false)
    }
  }

  const toggleDestinatario = (tipo: DestinatarioTipo) => {
    setFormData({
      ...formData,
      destinatarios: formData.destinatarios.includes(tipo)
        ? formData.destinatarios.filter((d) => d !== tipo)
        : [...formData.destinatarios, tipo],
    })
  }

  return (
    <DashboardLayout title="Enviar Nuevo Aviso" menuItems={menuItems}>
      <div className="space-y-6">
        <Link href="/dashboard/propietario/avisos">
            <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la lista
            </Button>
        </Link>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Enviar Aviso</CardTitle>
            <CardDescription>Crea un comunicado para tutores o personal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    placeholder="Ej: Inicio de clases"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                </div>
                
                {/* --- TEXTAREA ACTUALIZADO --- */}
                <div className="space-y-2">
                  <Label htmlFor="contenido">Mensaje *</Label> {/* El label puede decir 'Mensaje' */}
                  <Textarea
                    id="contenido" // <--- CAMBIADO
                    placeholder="Escribe el mensaje del aviso..."
                    value={formData.contenido} // <--- CAMBIADO
                    onChange={(e) => setFormData({ ...formData, contenido: e.target.value })} // <--- CAMBIADO
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Destinatarios</Label>
                  <p className="text-xs text-muted-foreground">
                    Si no seleccionas ninguno, se enviará a 'todos' por defecto.
                  </p>
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tutores"
                        checked={formData.destinatarios.includes("tutores")}
                        onCheckedChange={() => toggleDestinatario("tutores")}
                      />
                      <label htmlFor="tutores" className="text-sm cursor-pointer">
                        Tutores
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="personal"
                        checked={formData.destinatarios.includes("personal")}
                        onCheckedChange={() => toggleDestinatario("personal")}
                      />
                      <label htmlFor="personal" className="text-sm cursor-pointer">
                        Personal
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  {/* El botón ahora puede estar activo aunque no se marquen destinatarios */}
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4 mr-2" />
                    )}
                    {loading ? "Enviando..." : "Enviar Aviso"}
                  </Button>
                   <Link href="/dashboard/propietario/avisos">
                      <Button type="button" variant="outline">
                          Cancelar
                      </Button>
                   </Link>
                </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}