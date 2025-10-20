"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Send, Users, DollarSign, Bus, UserCog, Bell, BarChart3, TrendingDown } from "lucide-react"
import { mockAvisos, type Aviso } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

// --- DEFINICIÓN DEL MENÚ ---
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
]

export default function AvisosPage() {
  const [avisos, setAvisos] = useState<Aviso[]>(mockAvisos)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  // ✅ Tipado correcto del formulario (soluciona el error)
  const [formData, setFormData] = useState<{
    titulo: string
    mensaje: string
    destinatarios: ("tutores" | "personal" | "todos")[]
  }>({
    titulo: "",
    mensaje: "",
    destinatarios: [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newAviso: Aviso = {
      id: String(Date.now()),
      ...formData,
      fecha: new Date().toISOString().split("T")[0],
    }

    setAvisos([newAviso, ...avisos])
    toast({
      title: "Aviso enviado",
      description: `El aviso ha sido enviado a ${formData.destinatarios.join(", ")}.`,
    })

    setDialogOpen(false)
    setFormData({ titulo: "", mensaje: "", destinatarios: [] })
  }

  // ✅ Tipado correcto del toggle
  const toggleDestinatario = (tipo: "tutores" | "personal" | "todos") => {
    setFormData((prev) => ({
      ...prev,
      destinatarios: prev.destinatarios.includes(tipo)
        ? prev.destinatarios.filter((d) => d !== tipo)
        : [...prev.destinatarios, tipo],
    }))
  }

  return (
    <DashboardLayout title="Gestión de Avisos" menuItems={menuItems}>
      <div className="space-y-6">
        {/* --- CABECERA CON BOTÓN --- */}
        <div className="flex justify-end items-center">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Aviso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Enviar Aviso</DialogTitle>
                  <DialogDescription>Crea un comunicado para tutores o personal</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
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
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={formData.destinatarios.length === 0}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Aviso
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* --- LISTA DE AVISOS --- */}
        <div className="grid gap-4">
          {avisos.map((aviso) => (
            <Card key={aviso.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{aviso.titulo}</CardTitle>
                    <CardDescription className="mt-1">
                      {new Date(aviso.fecha + "T00:00:00").toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  <div className="text-xs text-muted-foreground">Para: {aviso.destinatarios.join(", ")}</div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{aviso.mensaje}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
