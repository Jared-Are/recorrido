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
import { Send, Users, DollarSign, Bus, UserCog, Bell, BarChart3, TrendingDown, ArrowLeft } from "lucide-react"
import { mockAvisos, type Aviso } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

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

export default function NuevoAvisoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    titulo: "",
    mensaje: "",
    destinatarios: [] as string[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const newAviso: Aviso = {
      id: String(Date.now()),
      ...formData,
      fecha: new Date().toISOString().split("T")[0],
    }

    mockAvisos.unshift(newAviso)
    toast({
      title: "Aviso enviado",
      description: `El aviso ha sido enviado a ${formData.destinatarios.join(", ")}.`,
    })

    setLoading(false)
    router.push("/dashboard/propietario/avisos")
  }

  const toggleDestinatario = (tipo: string) => {
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
                <div className="space-y-2">
                  <Label htmlFor="mensaje">Mensaje *</Label>
                  <Textarea
                    id="mensaje"
                    placeholder="Escribe el mensaje del aviso..."
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Destinatarios *</Label>
                  <div className="flex flex-col gap-2">
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
                <Button type="submit" disabled={loading || formData.destinatarios.length === 0}>
                  <Send className="h-4 w-4 mr-2" />
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