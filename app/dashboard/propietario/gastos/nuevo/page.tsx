"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Users, DollarSign, Bus, UserCog, Bell, BarChart3, TrendingDown, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { mockGastos, type Gasto } from "@/lib/mock-data"

// --- DEFINICIÓN DEL MENÚ PARA QUE EL LAYOUT FUNCIONE ---
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

export default function NuevoGastoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    descripcion: "",
    monto: "",
    categoria: "",
    microbus: "",
    fecha: new Date().toISOString().split("T")[0],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, categoria: value }))
  }

  const handleMicrobusChange = (value: string) => {
    setFormData(prev => ({ ...prev, microbus: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Crear el nuevo gasto con todas las propiedades requeridas
    const nuevoGasto: Gasto = {
      id: Date.now().toString(),
      descripcion: formData.descripcion,
      monto: parseFloat(formData.monto) || 0,
      categoria: formData.categoria,
      fecha: formData.fecha,
      microbus: formData.microbus || undefined, // Opcional
      estado: "activo" // Propiedad obligatoria añadida
    }

    mockGastos.unshift(nuevoGasto)

    toast({
      title: "Gasto Registrado",
      description: `Se registró el gasto: ${formData.descripcion}.`,
    })

    setLoading(false)
    router.push("/dashboard/propietario/gastos")
  }

  return (
    <DashboardLayout title="Registrar Gasto" menuItems={menuItems}>
      <div className="space-y-6">
        <Link href="/dashboard/propietario/gastos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista de gastos
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo Gasto</CardTitle>
            <CardDescription>Completa los detalles del gasto operativo.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="descripcion">Descripción *</Label>
                  <Input 
                    id="descripcion" 
                    placeholder="Ej: Cambio de aceite del bus 01"
                    value={formData.descripcion}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monto">Monto *</Label>
                  <Input 
                    id="monto" 
                    type="number" 
                    placeholder="Ej: 350.50"
                    value={formData.monto}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select 
                    onValueChange={handleCategoryChange} 
                    value={formData.categoria}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="combustible">Combustible</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="salarios">Salarios</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="microbus">Microbús</Label>
                  <Select 
                    onValueChange={handleMicrobusChange} 
                    value={formData.microbus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona microbús" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01">Microbús 01</SelectItem>
                      <SelectItem value="02">Microbús 02</SelectItem>
                      <SelectItem value="03">Microbús 03</SelectItem>
                      <SelectItem value="01 y 02">Microbús 01 y 02</SelectItem>
                      <SelectItem value="Todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="fecha">Fecha del Gasto *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading || !formData.descripcion || !formData.monto || !formData.categoria}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Guardando..." : "Registrar Gasto"}
                </Button>
                <Link href="/dashboard/propietario/gastos">
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