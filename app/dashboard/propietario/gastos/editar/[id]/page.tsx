"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Users, DollarSign, TrendingDown, Bus, UserCog, Bell, BarChart3 } from "lucide-react"
import Link from "next/link"
import { mockGastos } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

const menuItems: MenuItem[] = [
  { title: "Gestionar Alumnos", description: "Ver y administrar estudiantes", icon: Users, href: "/dashboard/propietario/alumnos", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
  { title: "Gestionar Pagos", description: "Ver historial y registrar pagos", icon: DollarSign, href: "/dashboard/propietario/pagos", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20" },
  { title: "Gestionar Gastos", description: "Control de combustible, salarios, etc.", icon: TrendingDown, href: "/dashboard/propietario/gastos", color: "text-pink-600", bgColor: "bg-pink-50 dark:bg-pink-900/20" },
  { title: "Gestionar Personal", description: "Administrar empleados y choferes", icon: Users, href: "/dashboard/propietario/personal", color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
  { title: "Gestionar Vehículos", description: "Administrar flota de vehículos", icon: Bus, href: "/dashboard/propietario/vehiculos", color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
  { title: "Gestionar Usuarios", description: "Administrar accesos al sistema", icon: UserCog, href: "/dashboard/propietario/usuarios", color: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-900/20" },
  { title: "Enviar Avisos", description: "Comunicados a tutores y personal", icon: Bell, href: "/dashboard/propietario/avisos", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
  { title: "Generar Reportes", description: "Estadísticas y análisis", icon: BarChart3, href: "/dashboard/propietario/reportes", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20" },
]

export default function EditarGastoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = searchParams.get('id')

  const [formData, setFormData] = useState({
    descripcion: "",
    categoria: "",
    microbus: "",
    monto: "",
    fecha: "",
    estado: "activo",
    notas: ""
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Cargar datos del gasto
  useEffect(() => {
    if (!id) {
      toast({
        title: "Error",
        description: "No se especificó el ID del gasto a editar",
        variant: "destructive"
      })
      router.push("/dashboard/propietario/gastos")
      return
    }

    const gasto = mockGastos.find(g => g.id === id)
    
    if (gasto) {
      setFormData({
        descripcion: gasto.descripcion,
        categoria: gasto.categoria,
        microbus: gasto.microbus || "",
        monto: gasto.monto.toString(),
        fecha: gasto.fecha,
        estado: gasto.estado || "activo",
        notas: gasto.notas || ""
      })
    } else {
      toast({
        title: "Error",
        description: "No se encontró el gasto a editar",
        variant: "destructive"
      })
      router.push("/dashboard/propietario/gastos")
    }
    
    setLoading(false)
  }, [id, router, toast])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Simular actualización en la base de datos
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Gasto actualizado",
        description: "El gasto se ha actualizado correctamente",
      })
      
      router.push("/dashboard/propietario/gastos")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el gasto",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Editar Gasto" menuItems={menuItems}>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Editar Gasto" menuItems={menuItems}>
      <div className="space-y-6">
        {/* Header con botón volver */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/propietario/gastos">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Editar Gasto</h1>
            <p className="text-muted-foreground">Modifica la información del gasto seleccionado</p>
          </div>
        </div>

        {/* Formulario de edición */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Gasto</CardTitle>
            <CardDescription>
              Actualiza los detalles del gasto. Los campos marcados con * son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Descripción */}
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción *</Label>
                  <Input
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleChange("descripcion", e.target.value)}
                    placeholder="Ej: Compra de combustible"
                    required
                  />
                </div>

                {/* Categoría */}
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => handleChange("categoria", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="combustible">Combustible</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="salarios">Salarios</SelectItem>
                      <SelectItem value="repuestos">Repuestos</SelectItem>
                      <SelectItem value="impuestos">Impuestos</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Microbús */}
                <div className="space-y-2">
                  <Label htmlFor="microbus">Microbús</Label>
                  <Select value={formData.microbus} onValueChange={(value) => handleChange("microbus", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un microbús" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="microbus-01">Microbús 01</SelectItem>
                      <SelectItem value="microbus-02">Microbús 02</SelectItem>
                      <SelectItem value="general">Gasto General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Monto */}
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto *</Label>
                  <Input
                    id="monto"
                    type="number"
                    value={formData.monto}
                    onChange={(e) => handleChange("monto", e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Fecha */}
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => handleChange("fecha", e.target.value)}
                    required
                  />
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={formData.estado} onValueChange={(value) => handleChange("estado", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notas">Notas Adicionales</Label>
                <Textarea
                  id="notas"
                  value={formData.notas}
                  onChange={(e) => handleChange("notas", e.target.value)}
                  placeholder="Información adicional sobre este gasto..."
                  rows={4}
                />
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar Cambios"}
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