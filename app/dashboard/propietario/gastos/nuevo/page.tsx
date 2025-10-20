"use client"

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
import { mockGastos } from "@/lib/mock-data"

export default function NuevoGastoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    descripcion: "",
    monto: "",
    categoria: "",
    fecha: new Date().toISOString().split("T")[0],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, categoria: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))

    const nuevoGasto = {
      id: Date.now().toString(),
      descripcion: formData.descripcion,
      monto: parseFloat(formData.monto) || 0,
      categoria: formData.categoria as any,
      fecha: formData.fecha,
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
    <DashboardLayout title="Registrar Gasto" menuItems={[]}>
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
