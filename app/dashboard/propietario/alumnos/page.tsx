"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { mockAlumnos, type Alumno } from "@/lib/mock-data"

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>(mockAlumnos)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAlumnos = alumnos.filter(
    (alumno) =>
      alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.tutor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.grado.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este alumno?")) {
      setAlumnos(alumnos.filter((a) => a.id !== id))
    }
  }

  return (
    <DashboardLayout title="Gestión de Alumnos">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar alumno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Link href="/dashboard/propietario/alumnos/nuevo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Alumno
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Alumnos</CardTitle>
            <CardDescription>Gestiona los estudiantes registrados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlumnos.map((alumno) => (
                    <TableRow key={alumno.id}>
                      <TableCell className="font-medium">{alumno.nombre}</TableCell>
                      <TableCell>{alumno.tutor}</TableCell>
                      <TableCell>{alumno.grado}</TableCell>
                      <TableCell>{alumno.contacto}</TableCell>
                      <TableCell>
                        <Badge variant={alumno.activo ? "default" : "secondary"}>
                          {alumno.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/propietario/alumnos/${alumno.id}`}>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(alumno.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
