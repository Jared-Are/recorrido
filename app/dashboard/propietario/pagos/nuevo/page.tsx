"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { mockAlumnos } from "@/lib/mock-data"

export default function NuevoPagoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    alumnoId: "",
    monto: "800",
    mes: "",
    fecha: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Pago registrado",
      description: "El pago ha sido registrado exitosamente.",
    })

    setLoading(false)
    router.push("/dashboard/propietario/pagos")
  }

  return (
    <DashboardLayout title="Registrar Pago">
      <div className="space-y-6">
        <Link href="/dashboard/propietario/pagos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo Pago</CardTitle>
            <CardDescription>Registra el pago mensual de un alumno</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="alumno">Alumno *</Label>
                  <Select
                    value={formData.alumnoId}
                    onValueChange={(value) => setFormData({ ...formData, alumnoId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un alumno" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockAlumnos.map((alumno) => (
                        <SelectItem key={alumno.id} value={alumno.id}>
                          {alumno.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mes">Mes *</Label>
                  <Select value={formData.mes} onValueChange={(value) => setFormData({ ...formData, mes: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el mes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Enero 2025">Enero 2025</SelectItem>
                      <SelectItem value="Febrero 2025">Febrero 2025</SelectItem>
                      <SelectItem value="Marzo 2025">Marzo 2025</SelectItem>
                      <SelectItem value="Abril 2025">Abril 2025</SelectItem>
                      <SelectItem value="Mayo 2025">Mayo 2025</SelectItem>
                      <SelectItem value="Junio 2025">Junio 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monto">Monto *</Label>
                  <Input
                    id="monto"
                    type="number"
                    placeholder="800"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
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
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar Pago"}
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
