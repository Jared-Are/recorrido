"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calendar, DollarSign, Bell, CheckCircle2, XCircle } from "lucide-react"
import { mockPagos, mockAsistencias, mockAvisos } from "@/lib/mock-data"

export default function TutorDashboard() {
  // Simulating data for the logged-in tutor's child (Juan Pérez - alumnoId: "1")
  const alumnoId = "1"
  const alumnoNombre = "Juan Pérez"

  const [pagos] = useState(mockPagos.filter((p) => p.alumnoId === alumnoId))
  const [asistencias] = useState(mockAsistencias.filter((a) => a.alumnoId === alumnoId))
  const [avisos] = useState(mockAvisos.filter((a) => a.destinatarios.includes("tutores")))

  // Calculate stats
  const totalPagado = pagos.filter((p) => p.estado === "pagado").reduce((sum, p) => sum + p.monto, 0)
  const totalPendiente = pagos.filter((p) => p.estado === "pendiente").reduce((sum, p) => sum + p.monto, 0)
  const asistenciasPorcentaje =
    asistencias.length > 0 ? (asistencias.filter((a) => a.presente).length / asistencias.length) * 100 : 0

  return (
    <DashboardLayout title="Panel de Tutor">
      <div className="space-y-6">
        {/* Student Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Información del Alumno</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">{alumnoNombre.charAt(0)}</span>
              </div>
              <div>
                <div className="font-semibold text-lg">{alumnoNombre}</div>
                <div className="text-sm text-muted-foreground">3° Primaria</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Pagado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalPagado.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {pagos.filter((p) => p.estado === "pagado").length} pagos realizados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pendiente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">${totalPendiente.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {pagos.filter((p) => p.estado === "pendiente").length} pagos pendientes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Asistencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{asistenciasPorcentaje.toFixed(0)}%</div>
              <Progress value={asistenciasPorcentaje} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pagos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pagos">Pagos</TabsTrigger>
            <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
            <TabsTrigger value="avisos">Avisos</TabsTrigger>
          </TabsList>

          <TabsContent value="pagos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Pagos</CardTitle>
                <CardDescription>Registro de pagos mensuales de {alumnoNombre}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mes</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Fecha de Pago</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagos.map((pago) => (
                        <TableRow key={pago.id}>
                          <TableCell className="font-medium">{pago.mes}</TableCell>
                          <TableCell>${pago.monto.toLocaleString()}</TableCell>
                          <TableCell>{pago.fecha ? new Date(pago.fecha).toLocaleDateString("es-MX") : "-"}</TableCell>
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
          </TabsContent>

          <TabsContent value="asistencia" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registro de Asistencia</CardTitle>
                <CardDescription>Historial de asistencia de {alumnoNombre}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {asistencias.length > 0 ? (
                    asistencias.map((asistencia) => (
                      <div key={asistencia.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {asistencia.presente ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <div className="font-medium">
                              {new Date(asistencia.fecha).toLocaleDateString("es-MX", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                            {asistencia.hora && (
                              <div className="text-sm text-muted-foreground">Hora: {asistencia.hora}</div>
                            )}
                          </div>
                        </div>
                        <Badge variant={asistencia.presente ? "default" : "secondary"}>
                          {asistencia.presente ? "Presente" : "Ausente"}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay registros de asistencia disponibles
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="avisos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Avisos Recibidos</CardTitle>
                <CardDescription>Comunicados importantes del recorrido escolar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {avisos.length > 0 ? (
                    avisos.map((aviso) => (
                      <div key={aviso.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">{aviso.titulo}</h3>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(aviso.fecha).toLocaleDateString("es-MX")}
                          </span>
                        </div>
                        <p className="text-sm text-foreground pl-7">{aviso.mensaje}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No hay avisos disponibles</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
