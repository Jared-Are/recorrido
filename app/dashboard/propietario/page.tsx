"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, DollarSign, Users, Bus, UserCog, Bell, BarChart3, ChevronRight } from "lucide-react"
import Link from "next/link"

const menuItems = [
  {
    title: "Registrar Alumno",
    description: "Agregar nuevo estudiante al sistema",
    icon: UserPlus,
    href: "/dashboard/propietario/alumnos/nuevo",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Registrar Pago",
    description: "Registrar pago de mensualidad",
    icon: DollarSign,
    href: "/dashboard/propietario/pagos/nuevo",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Gestionar Personal",
    description: "Administrar empleados y choferes",
    icon: Users,
    href: "/dashboard/propietario/personal",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Gestionar Vehículos",
    description: "Administrar flota de vehículos",
    icon: Bus,
    href: "/dashboard/propietario/vehiculos",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Gestionar Usuarios",
    description: "Administrar accesos al sistema",
    icon: UserCog,
    href: "/dashboard/propietario/usuarios",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    title: "Enviar Avisos",
    description: "Comunicados a tutores y personal",
    icon: Bell,
    href: "/dashboard/propietario/avisos",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    title: "Generar Reportes",
    description: "Estadísticas y análisis",
    icon: BarChart3,
    href: "/dashboard/propietario/reportes",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
]

const quickStats = [
  { label: "Alumnos Activos", value: "45", change: "+3 este mes" },
  { label: "Pagos del Mes", value: "$32,500", change: "89% completado" },
  { label: "Personal", value: "8", change: "2 choferes, 6 asistentes" },
  { label: "Vehículos", value: "4", change: "Todos operativos" },
]

export default function PropietarioDashboard() {
  return (
    <DashboardLayout title="Panel de Administración">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">{stat.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Menu */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Accesos Rápidos</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.title} href={item.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg ${item.bgColor}`}>
                          <Icon className={`h-6 w-6 ${item.color}`} />
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-base mt-3">{item.title}</CardTitle>
                      <CardDescription className="text-sm">{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
