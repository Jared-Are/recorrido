"use client"

import { TutorLayout } from "@/components/tutor-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bell } from "lucide-react"
import {
  mockPagos,
  mockAsistencias,
  mockAlumnos,
  mockAvisos,
} from "@/lib/mock-data"
import { Button } from "@/components/ui/button"

export default function TutorDashboard() {
  // --- DATOS DEL TUTOR ---
  const tutorData = {
    hijos: mockAlumnos.filter((a) => a.tutor === "María Pérez"),
  }

  const hijosIds = tutorData.hijos.map((h) => h.id)
  const pagos = mockPagos.filter((p) => hijosIds.includes(p.alumnoId))
  const asistencias = mockAsistencias.filter((a) => hijosIds.includes(a.alumnoId))
  const avisos = mockAvisos.filter((a) => a.destinatarios.includes("tutores"))

  // --- LÓGICA DE PAGOS ---
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ]

  let ultimoMesPagado = "N/A"
  let totalPagadoUltimoMes = 0
  let mesPendiente = "Al día"
  let totalPendienteMesSiguiente = 0

  const pagosPagados = pagos.filter((p) => p.estado === "pagado")
  const pagosPendientes = pagos.filter((p) => p.estado === "pendiente")

  if (pagosPagados.length > 0) {
    let ultimoPago = pagosPagados[0]
    let ultimoIndiceMes = -1
    pagosPagados.forEach((pago) => {
      const [nombreMes] = pago.mes.split(" ")
      const indiceActual = meses.indexOf(nombreMes)
      if (indiceActual > ultimoIndiceMes) {
        ultimoIndiceMes = indiceActual
        ultimoPago = pago
      }
    })
    ultimoMesPagado = ultimoPago.mes
    totalPagadoUltimoMes = ultimoPago.monto
  }

  if (pagosPendientes.length > 0) {
    let primerPagoPendiente = pagosPendientes[0]
    let primerIndiceMes = 12
    pagosPendientes.forEach((pago) => {
      const [nombreMes] = pago.mes.split(" ")
      const indiceActual = meses.indexOf(nombreMes)
      if (indiceActual < primerIndiceMes) {
        primerIndiceMes = indiceActual
        primerPagoPendiente = pago
      }
    })
    mesPendiente = primerPagoPendiente.mes
    totalPendienteMesSiguiente = primerPagoPendiente.monto
  }

  // --- LÓGICA DE ASISTENCIAS ---
  const asistenciasTotales = asistencias.length
  const presenciasTotales = asistencias.filter((a) => a.presente).length
  const asistenciasPorcentaje =
    asistenciasTotales > 0
      ? (presenciasTotales / asistenciasTotales) * 100
      : 0

  // --- RENDERIZADO ---
  return (
    <TutorLayout title="Panel del Tutor">
      <div className="space-y-6 pb-20"> {/* padding para barra inferior */}
        {/* Encabezado */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Resumen Familiar
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-6 w-6" />
              {avisos.length > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {avisos.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Tarjeta de Hijos */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Hijos</CardTitle>
            <CardDescription>
              Resumen y estado de tus hijos en el servicio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tutorData.hijos.map((hijo) => (
              <div
                key={hijo.id}
                className="flex items-center justify-between p-3 border rounded-lg dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {hijo.nombre.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{hijo.nombre}</div>
                    <div className="text-sm text-muted-foreground">
                      {hijo.grado}
                    </div>
                  </div>
                </div>
                <Badge variant={hijo.activo ? "default" : "secondary"}>
                  {hijo.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Resumen Financiero y Asistencias */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">
                Último mes pagado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                ${totalPagadoUltimoMes.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {ultimoMesPagado}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">
                Mes pendiente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">
                ${totalPendienteMesSiguiente.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {mesPendiente}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">
                Asistencia General
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {asistenciasPorcentaje.toFixed(0)}%
              </div>
              <Progress value={asistenciasPorcentaje} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      </div>
    </TutorLayout>
  )
}
