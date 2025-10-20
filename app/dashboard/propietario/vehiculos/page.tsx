"use client"

import { useState } from "react"
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout" // <-- Importar MenuItem
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Users, DollarSign, Bus, UserCog, Bell, BarChart3, TrendingDown } from "lucide-react" // <-- ICONOS REQUERIDOS
import { mockVehiculos, mockPersonal, type Vehiculo } from "@/lib/mock-data"
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

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(mockVehiculos)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    placa: "",
    modelo: "",
    choferId: "",
  })

  const choferes = mockPersonal.filter((p) => p.cargo === "chofer")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const chofer = choferes.find((c) => c.id === formData.choferId)

    if (editingId) {
      setVehiculos(
        vehiculos.map((v) => (v.id === editingId ? { ...v, ...formData, choferNombre: chofer?.nombre || "" } : v)),
      )
      toast({ title: "Vehículo actualizado", description: "Los datos han sido actualizados exitosamente." })
    } else {
      const newVehiculo: Vehiculo = {
        id: String(Date.now()), // Usar un ID más único
        ...formData,
        choferNombre: chofer?.nombre || "",
        estado: "operativo",
      }
      setVehiculos([...vehiculos, newVehiculo])
      toast({ title: "Vehículo registrado", description: "El vehículo ha sido registrado exitosamente." })
    }

    setDialogOpen(false)
    resetForm()
  }

  const handleEdit = (v: Vehiculo) => {
    setEditingId(v.id)
    setFormData({
      placa: v.placa,
      modelo: v.modelo,
      choferId: v.choferId,
    })
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este vehículo?")) {
      setVehiculos(vehiculos.filter((v) => v.id !== id))
      toast({ title: "Vehículo eliminado", description: "El registro ha sido eliminado." })
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({ placa: "", modelo: "", choferId: "" })
  }

  return (
    <DashboardLayout title="Gestión de Vehículos" menuItems={menuItems}> {/* <-- AÑADIR menuItems */}
      <div className="space-y-6">
        {/* --- CABECERA CON BOTONES --- */}
        <div className="flex justify-end items-center"> {/* <-- Centrar el DialogTrigger a la derecha */}
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open)
                if (!open) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Vehículo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingId ? "Editar Vehículo" : "Nuevo Vehículo"}</DialogTitle>
                    <DialogDescription>Completa los datos del vehículo</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="placa">Placa *</Label>
                      <Input
                        id="placa"
                        placeholder="ABC-123"
                        value={formData.placa}
                        onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="modelo">Modelo *</Label>
                      <Input
                        id="modelo"
                        placeholder="Mercedes Sprinter 2020"
                        value={formData.modelo}
                        onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chofer">Chofer Asignado *</Label>
                      <Select
                        value={formData.choferId}
                        onValueChange={(value) => setFormData({ ...formData, choferId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un chofer" />
                        </SelectTrigger>
                        <SelectContent>
                          {choferes.map((chofer) => (
                            <SelectItem key={chofer.id} value={chofer.id}>
                              {chofer.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingId ? "Actualizar" : "Guardar"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Flota de Vehículos</CardTitle>
            <CardDescription>Gestiona los vehículos del recorrido escolar</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Chofer Asignado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehiculos.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.placa}</TableCell>
                    <TableCell>{v.modelo}</TableCell>
                    <TableCell>{v.choferNombre}</TableCell>
                    <TableCell>
                      <Badge variant={v.estado === "operativo" ? "default" : "secondary"}>
                        {v.estado === "operativo" ? "Operativo" : "Mantenimiento"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(v)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}