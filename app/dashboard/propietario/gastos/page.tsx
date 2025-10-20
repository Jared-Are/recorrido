"use client"

import { useState } from "react"
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Users, DollarSign, Bus, UserCog, Bell, BarChart3, TrendingDown } from "lucide-react"
import Link from "next/link"
import { mockGastos, type Gasto } from "@/lib/mock-data"

const menuItems: MenuItem[] = [
  { title: "Gestionar Alumnos", description: "Ver y administrar estudiantes", icon: Users, href: "/dashboard/propietario/alumnos", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
  { title: "Gestionar Pagos", description: "Ver historial y registrar pagos", icon: DollarSign, href: "/dashboard/propietario/pagos", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20" },
  { title: "Gestionar Gastos", description: "Control de combustible, salarios, etc.", icon: TrendingDown, href: "/dashboard/propietario/gastos", color: "text-pink-600", bgColor: "bg-pink-50 dark:bg-pink-900/20" },
  { title: "Gestionar Personal", description: "Administrar empleados y choferes", icon: Users, href: "/dashboard/propietario/personal", color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
  { title: "Gestionar Vehículos", description: "Administrar flota de vehículos", icon: Bus, href: "/dashboard/propietario/vehiculos", color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
  { title: "Gestionar Usuarios", description: "Administrar accesos al sistema", icon: UserCog, href: "/dashboard/propietario/usuarios", color: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-900/20" },
  { title: "Enviar Avisos", description: "Comunicados a tutores y personal", icon: Bell, href: "/dashboard/propietario/avisos", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
  { title: "Generar Reportes", description: "Estadísticas y análisis", icon: BarChart3, href: "/dashboard/propietario/reportes", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20" },
]

export default function GastosPage() {
  const [gastos] = useState<Gasto[]>(mockGastos)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredGastos = gastos.filter(
    (gasto) =>
      gasto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gasto.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalGastado = gastos.reduce((sum, g) => sum + g.monto, 0)
  const hoy = new Date()
  const mesActual = hoy.getFullYear() + "-" + String(hoy.getMonth() + 1).padStart(2, "0")
  const gastoDelMes = gastos.filter((g) => g.fecha.startsWith(mesActual)).reduce((sum, g) => sum + g.monto, 0)
  const gastoMicrobusA = gastos.filter((g) => g.microbus === "A").reduce((sum, g) => sum + g.monto, 0)
  const gastoMicrobusB = gastos.filter((g) => g.microbus === "B").reduce((sum, g) => sum + g.monto, 0)

  const getBadgeVariant = (categoria: string) => {
    switch (categoria) {
      case "combustible":
        return "destructive"
      case "mantenimiento":
        return "secondary"
      case "salarios":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <DashboardLayout title="Gestión de Gastos" menuItems={menuItems}>
      <div className="space-y-6">

        {/* --- TARJETAS 2x2 --- */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Gasto Total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-red-600">${totalGastado.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Gasto de este Mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-orange-600">${gastoDelMes.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Gasto Microbús A</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-blue-600">${gastoMicrobusA.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Gasto Microbús B</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-600">${gastoMicrobusB.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* --- BOTÓN Y BUSCADOR --- */}
        <div className="flex flex-col-reverse sm:flex-col gap-4 w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descripción o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Link href="/dashboard/propietario/gastos/nuevo" className="w-full">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Gasto
            </Button>
          </Link>
        </div>

        {/* --- TABLA --- */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Gastos</CardTitle>
            <CardDescription>Registro de todos los gastos operativos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Microbús</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGastos.map((gasto) => (
                    <TableRow key={gasto.id}>
                      <TableCell className="font-medium">{gasto.descripcion}</TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(gasto.categoria)}>
                          {gasto.categoria.charAt(0).toUpperCase() + gasto.categoria.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{gasto.microbus}</TableCell>
                      <TableCell>${gasto.monto.toLocaleString()}</TableCell>
                      <TableCell>{new Date(gasto.fecha + "T00:00:00").toLocaleDateString()}</TableCell>
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
