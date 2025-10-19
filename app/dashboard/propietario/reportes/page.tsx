"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, TrendingUp, Users, DollarSign, Calendar } from "lucide-react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

// Mock data for charts
const pagosPorMes = [
  { mes: "Agosto", monto: 28800, pagos: 36 },
  { mes: "Septiembre", monto: 32000, pagos: 40 },
  { mes: "Octubre", monto: 30400, pagos: 38 },
  { mes: "Noviembre", monto: 33600, pagos: 42 },
  { mes: "Diciembre", monto: 29600, pagos: 37 },
  { mes: "Enero", monto: 32500, pagos: 40 },
]

const asistenciaPorMes = [
  { mes: "Agosto", porcentaje: 92 },
  { mes: "Septiembre", porcentaje: 88 },
  { mes: "Octubre", porcentaje: 95 },
  { mes: "Noviembre", porcentaje: 90 },
  { mes: "Diciembre", porcentaje: 85 },
  { mes: "Enero", porcentaje: 93 },
]

const estadoPagos = [
  { nombre: "Pagados", valor: 40, color: "#10b981" },
  { nombre: "Pendientes", valor: 5, color: "#f59e0b" },
]

const alumnosPorGrado = [
  { grado: "1° Primaria", alumnos: 8 },
  { grado: "2° Primaria", alumnos: 7 },
  { grado: "3° Primaria", alumnos: 10 },
  { grado: "4° Primaria", alumnos: 9 },
  { grado: "5° Primaria", alumnos: 6 },
  { grado: "6° Primaria", alumnos: 5 },
]

export default function ReportesPage() {
  const { toast } = useToast()
  const [periodo, setPeriodo] = useState("semestre")

  const handleExportar = () => {
    toast({
      title: "Reporte exportado",
      description: "El reporte ha sido descargado exitosamente.",
    })
  }

  return (
    <DashboardLayout title="Reportes y Estadísticas">
      <div className="space-y-6">
        {/* Header with filters */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Análisis de Datos</h2>
            <p className="text-sm text-muted-foreground">Visualiza el rendimiento del recorrido escolar</p>
          </div>
          <div className="flex gap-3">
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mes">Último mes</SelectItem>
                <SelectItem value="trimestre">Último trimestre</SelectItem>
                <SelectItem value="semestre">Último semestre</SelectItem>
                <SelectItem value="anio">Último año</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportar}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Ingresos Totales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$187,900</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">+12%</span> vs periodo anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs flex items-center gap-2">
                <Users className="h-4 w-4" />
                Alumnos Activos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground mt-1">3 nuevos este mes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Asistencia Promedio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">90.5%</div>
              <p className="text-xs text-muted-foreground mt-1">Excelente rendimiento</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Tasa de Cobro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-muted-foreground mt-1">40 de 45 pagos al día</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pagos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pagos">Pagos</TabsTrigger>
            <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
            <TabsTrigger value="alumnos">Alumnos</TabsTrigger>
          </TabsList>

          <TabsContent value="pagos" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos por Mes</CardTitle>
                  <CardDescription>Total de pagos recibidos mensualmente</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      monto: {
                        label: "Monto",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pagosPorMes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="monto" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estado de Pagos</CardTitle>
                  <CardDescription>Distribución de pagos del mes actual</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      pagados: {
                        label: "Pagados",
                        color: "#10b981",
                      },
                      pendientes: {
                        label: "Pendientes",
                        color: "#f59e0b",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={estadoPagos}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ nombre, valor }) => `${nombre}: ${valor}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="valor"
                        >
                          {estadoPagos.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Pagos</CardTitle>
                <CardDescription>Número de pagos recibidos por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    pagos: {
                      label: "Pagos",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pagosPorMes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="pagos" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="asistencia" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Porcentaje de Asistencia Mensual</CardTitle>
                <CardDescription>Evolución de la asistencia en los últimos meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    porcentaje: {
                      label: "Asistencia %",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={asistenciaPorMes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="porcentaje" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alumnos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Alumnos por Grado</CardTitle>
                <CardDescription>Cantidad de estudiantes en cada nivel</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    alumnos: {
                      label: "Alumnos",
                      color: "hsl(var(--chart-4))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={alumnosPorGrado} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="grado" type="category" width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="alumnos" fill="hsl(var(--chart-4))" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
