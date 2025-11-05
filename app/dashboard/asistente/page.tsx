"use client"

import { useState, useEffect } from "react"
import { AsistenteLayout } from "@/components/asistente-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Bell,
  ArrowRight,
  Car,
  Users,
  UserCheck,
  UserX,
  CalendarCheck,
} from "lucide-react"
import {
  mockAlumnos,
  mockAvisos,
  mockAsistencias,
  mockVehiculos,
} from "@/lib/mock-data"

export default function AsistenteDashboard() {
  const [isWeekend, setIsWeekend] = useState(false)
  const [avisos] = useState(
    mockAvisos.filter((a) => a.destinatarios.includes("personal"))
  )

  // Datos del día
  const todayISO = new Date().toISOString().split("T")[0]
  const asistenciasHoy = mockAsistencias.filter((a) => a.fecha === todayISO)
  const totalAlumnos = mockAlumnos.length
  const ausentesHoy = asistenciasHoy.filter((a) => !a.presente).length
  const presentesHoy = totalAlumnos - ausentesHoy
  const vehiculoAsignado = mockVehiculos[0]

  useEffect(() => {
    const today = new Date().getDay()
    if (today === 0 || today === 6) setIsWeekend(true)
  }, [])

  const todayFormatted = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const quickStats = [
    {
      label: "Vehículo Asignado",
      value: vehiculoAsignado.placa,
      change: vehiculoAsignado.choferNombre,
      icon: Car,
    },
    {
      label: "Total de Alumnos",
      value: totalAlumnos.toString(),
      change: "En esta ruta",
      icon: Users,
    },
    {
      label: "Presentes Hoy",
      value: presentesHoy.toString(),
      change: "Alumnos a bordo",
      icon: UserCheck,
    },
    {
      label: "Ausentes Hoy",
      value: ausentesHoy.toString(),
      change: "Marcados ausentes",
      icon: UserX,
    },
  ]

  return (
    <AsistenteLayout title="Panel del Asistente">
      {/* Encabezado principal */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Resumen del Día</h1>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-6 w-6" />
          {avisos.length > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {avisos.length}
            </span>
          )}
        </Button>
      </div>

      {/* Tarjeta del día */}
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{todayFormatted}</CardTitle>
          <CardDescription>
            {isWeekend
              ? "Hoy es fin de semana, no hay recorrido programado."
              : "Listo para iniciar el recorrido. Registra la asistencia."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/dashboard/asistente/asistencia">
            <Button disabled={isWeekend}>
              Registrar Asistencia del Día
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2 flex items-center gap-2">
              <stat.icon className="h-4 w-4" />
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AsistenteLayout>
  )
}
