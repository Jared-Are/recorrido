"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
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
import { Plus, Pencil, Trash2 } from "lucide-react"
import { mockPersonal, type Personal } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

export default function PersonalPage() {
  const [personal, setPersonal] = useState<Personal[]>(mockPersonal)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    nombre: "",
    cargo: "asistente" as "chofer" | "asistente",
    telefono: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      setPersonal(personal.map((p) => (p.id === editingId ? { ...p, ...formData } : p)))
      toast({ title: "Personal actualizado", description: "Los datos han sido actualizados exitosamente." })
    } else {
      const newPersonal: Personal = {
        id: String(personal.length + 1),
        ...formData,
        activo: true,
      }
      setPersonal([...personal, newPersonal])
      toast({ title: "Personal registrado", description: "El personal ha sido registrado exitosamente." })
    }

    setDialogOpen(false)
    resetForm()
  }

  const handleEdit = (p: Personal) => {
    setEditingId(p.id)
    setFormData({
      nombre: p.nombre,
      cargo: p.cargo,
      telefono: p.telefono,
    })
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este registro?")) {
      setPersonal(personal.filter((p) => p.id !== id))
      toast({ title: "Personal eliminado", description: "El registro ha sido eliminado." })
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({ nombre: "", cargo: "asistente", telefono: "" })
  }

  return (
    <DashboardLayout title="Gestión de Personal">
      <div className="space-y-6">
        <div className="flex justify-end">
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
                Nuevo Personal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingId ? "Editar Personal" : "Nuevo Personal"}</DialogTitle>
                  <DialogDescription>Completa los datos del personal</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre Completo *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo *</Label>
                    <Select
                      value={formData.cargo}
                      onValueChange={(value: "chofer" | "asistente") => setFormData({ ...formData, cargo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chofer">Chofer</SelectItem>
                        <SelectItem value="asistente">Asistente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      required
                    />
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
            <CardTitle>Lista de Personal</CardTitle>
            <CardDescription>Gestiona choferes y asistentes de ruta</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personal.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.cargo === "chofer" ? "Chofer" : "Asistente"}</Badge>
                    </TableCell>
                    <TableCell>{p.telefono}</TableCell>
                    <TableCell>
                      <Badge variant={p.activo ? "default" : "secondary"}>{p.activo ? "Activo" : "Inactivo"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
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
