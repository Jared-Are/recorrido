"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Users, DollarSign, Bus, UserCog, Bell, BarChart3, TrendingDown } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { mockAlumnos, mockPagos } from "@/lib/mock-data"

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


export default function NuevoPagoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [pagarAnioCompleto, setPagarAnioCompleto] = useState(false)
  const [formData, setFormData] = useState({
    alumnoId: "",
    alumnoNombre: "",
    monto: "",
    mes: "",
    fecha: new Date().toISOString().split("T")[0],
  })

  // Hook para actualizar el formulario cuando cambia el alumno o la opción de pago anual
  useEffect(() => {
    if (!formData.alumnoId) return

    const alumno = mockAlumnos.find((a) => a.id === formData.alumnoId)
    if (!alumno) return
    
    const montoMensual = alumno.precio ?? 800
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    let mesSugerido = "Enero 2025"
    let montoSugerido = montoMensual.toString()

    if (pagarAnioCompleto) {
      montoSugerido = (montoMensual * 12).toString()
      mesSugerido = "Año Completo 2025"
    } else {
      const pagosAlumno = mockPagos.filter((p) => p.alumnoId === formData.alumnoId)
      if (pagosAlumno.length > 0) {
        // Ordenar pagos por mes para encontrar el último
        const ultimoPago = pagosAlumno.sort((a, b) => meses.indexOf(b.mes.split(" ")[0]) - meses.indexOf(a.mes.split(" ")[0]))[0];
        const ultimoMesIdx = meses.indexOf(ultimoPago.mes.split(" ")[0]);
        const siguienteMes = meses[(ultimoMesIdx + 1) % 12];
        mesSugerido = `${siguienteMes} 2025`;
      }
    }

    setFormData(prev => ({
        ...prev,
        alumnoNombre: alumno.nombre,
        monto: montoSugerido,
        mes: mesSugerido,
    }))

  }, [formData.alumnoId, pagarAnioCompleto])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.alumnoId) return

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (pagarAnioCompleto) {
      const alumno = mockAlumnos.find(a => a.id === formData.alumnoId)
      const montoMensual = alumno?.precio ?? 800
      const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ]

      meses.forEach(mes => {
        const nuevoPago = {
          id: `${Date.now()}-${mes}`,
          alumnoId: formData.alumnoId,
          alumnoNombre: formData.alumnoNombre,
          monto: montoMensual,
          mes: `${mes} 2025`,
          fecha: formData.fecha,
          estado: "pagado" as const,
        }
        mockPagos.unshift(nuevoPago)
      })
      
      toast({
        title: "Año Completo Registrado",
        description: `Se registraron los 12 meses para ${formData.alumnoNombre}.`,
      })

    } else {
      const nuevoPago = {
        id: Date.now().toString(),
        alumnoId: formData.alumnoId,
        alumnoNombre: formData.alumnoNombre,
        monto: parseFloat(formData.monto),
        mes: formData.mes,
        fecha: formData.fecha,
        estado: "pagado" as const,
      }
      mockPagos.unshift(nuevoPago)
      toast({
        title: "Pago registrado",
        description: `Se registró el pago de ${formData.alumnoNombre} (${formData.mes}).`,
      })
    }
    
    setLoading(false)
    router.push("/dashboard/propietario/pagos")
  }

  return (
    <DashboardLayout title="Registrar Pago" menuItems={menuItems}>
      <div className="space-y-6">
        {/* --- BOTÓN DE VOLVER A LA LISTA (EL DE VOLVER AL MENÚ ES AUTOMÁTICO) --- */}
        <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/propietario/pagos">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la lista
              </Button>
            </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo Pago</CardTitle>
            <CardDescription>Selecciona un alumno y el tipo de pago.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="alumno">Alumno *</Label>
                  <select
                    id="alumno"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.alumnoId}
                    onChange={(e) => setFormData(prev => ({ ...prev, alumnoId: e.target.value }))}
                    required
                  >
                    <option value="">Selecciona un alumno</option>
                    {mockAlumnos.map((alumno) => (
                      <option key={alumno.id} value={alumno.id}>
                        {alumno.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="items-top flex space-x-2 col-span-2">
                  <Checkbox id="anioCompleto" checked={pagarAnioCompleto} onCheckedChange={(checked) => setPagarAnioCompleto(checked as boolean)} />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="anioCompleto"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Pagar año completo
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Registra automáticamente los 12 meses del año.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monto">Monto</Label>
                  <Input id="monto" value={formData.monto ? `$${parseFloat(formData.monto).toLocaleString()}` : ''} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mes">Periodo</Label>
                  <Input id="mes" value={formData.mes} disabled />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="fecha">Fecha de Pago *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading || !formData.alumnoId}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Guardando..." : "Registrar Pago"}
                </Button>
                <Link href="/dashboard/propietario/pagos">
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