"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, LayoutDashboard } from "lucide-react" // Ícono añadido
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { mockAlumnos, mockPagos } from "@/lib/mock-data"

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
    <DashboardLayout title="Registrar Pago">
      <div className="space-y-6">
        {/* --- CONTENEDOR DE BOTONES DE NAVEGACIÓN --- */}
        <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/propietario/pagos">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la lista
              </Button>
            </Link>
            <Link href="/dashboard/propietario">
              <Button variant="outline" size="sm">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Volver al Menú Principal
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
                    className="border p-2 rounded-md w-full"
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

