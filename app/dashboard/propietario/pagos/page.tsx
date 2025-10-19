"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { mockPagos, type Pago } from "@/lib/mock-data"

export default function PagosPage() {
  const [pagos] = useState<Pago[]>(mockPagos)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPagos = pagos.filter(
    (pago) =>
      pago.alumnoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.mes.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPagado = pagos.filter((p) => p.estado === "pagado").reduce((sum, p) => sum + p.monto, 0)
  const totalPendiente = pagos.filter((p) => p.estado === "pendiente").reduce((sum, p) => sum + p.monto, 0)

  return (
    <DashboardLayout title="Gestión de Pagos">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Pagado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalPagado.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Pendiente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">${totalPendiente.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Registros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagos.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pago..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Link href="/dashboard/propietario/pagos/nuevo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Pago
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Pagos</CardTitle>
            <CardDescription>Registro de pagos mensuales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumno</TableHead>
                    <TableHead>Mes</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha de Pago</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPagos.map((pago) => (
                    <TableRow key={pago.id}>
                      <TableCell className="font-medium">{pago.alumnoNombre}</TableCell>
                      <TableCell>{pago.mes}</TableCell>
                      <TableCell>${pago.monto.toLocaleString()}</TableCell>
                      <TableCell>{pago.fecha || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={pago.estado === "pagado" ? "default" : "secondary"}>
                          {pago.estado === "pagado" ? "Pagado" : "Pendiente"}
                        </Badge>
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
