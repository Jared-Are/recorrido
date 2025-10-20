"use client"

import React, { useState, useEffect } from "react" // <-- Añadido useEffect
import {
    Download,
    TrendingUp,
    Users,
    DollarSign,
    TrendingDown,
    Bus,
    UserCog,
    Bell,
    BarChart3,
} from "lucide-react"
import {
    Bar,
    BarChart,
    Pie,
    PieChart,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
} from "recharts"

// Importaciones de la nueva estructura de componentes
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// ====================================================================
// 1. DEFINICIÓN DEL MENÚ
// ====================================================================

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
]

// ====================================================================
// 2. DATOS DE REPORTE Y LÓGICA
// ====================================================================

const pagosPorMes = [
    { mes: "Ago", monto: 28800 }, { mes: "Sep", monto: 32000 }, { mes: "Oct", monto: 30400 },
    { mes: "Nov", monto: 33600 }, { mes: "Dic", monto: 29600 }, { mes: "Ene", monto: 32500 },
]
const asistenciaPorMes = [
    { mes: "Ago", porcentaje: 92 }, { mes: "Sep", porcentaje: 88 }, { mes: "Oct", porcentaje: 95 },
    { mes: "Nov", porcentaje: 90 }, { mes: "Dic", porcentaje: 85 }, { mes: "Ene", porcentaje: 93 },
]
const estadoPagos = [
    { nombre: "Pagados", valor: 40, color: "#10b981" }, // verde
    { nombre: "Pendientes", valor: 5, color: "#f59e0b" }, // ambar
]
const alumnosPorGrado = [
    { grado: "1° Primaria", alumnos: 8 }, { grado: "2° Primaria", alumnos: 7 }, { grado: "3° Primaria", alumnos: 10 },
    { grado: "4° Primaria", alumnos: 9 }, { grado: "5° Primaria", alumnos: 6 }, { grado: "6° Primaria", alumnos: 5 },
]
const finanzasPorVehiculo = [
    { mes: "Oct", ingresosA: 19550, gastosA: 6050, ingresosB: 10850, gastosB: 4800 },
    { mes: "Nov", ingresosA: 21000, gastosA: 5800, ingresosB: 12600, gastosB: 5100 },
    { mes: "Dic", ingresosA: 18400, gastosA: 7100, ingresosB: 11200, gastosB: 4500 },
    { mes: "Ene", ingresosA: 20500, gastosA: 6200, ingresosB: 12000, gastosB: 4900 },
]

// ====================================================================
// 3. COMPONENTE DE PÁGINA
// ====================================================================

export default function ReportesPage() {
    const { toast } = useToast()
    const [periodo, setPeriodo] = useState("semestre")
    
    // --- CAMBIO 2: LÓGICA PARA REACCIONAR AL MODO OSCURO ---
    // Este estado 'isDarkMode' no cambia el tema, solo se usa para
    // forzar un re-render de los gráficos cuando el tema cambia.
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Función para verificar si la clase 'dark' existe en <html>
        const checkTheme = () => {
             const isDark = document.documentElement.classList.contains('dark');
             setIsDarkMode(isDark);
        };

        // Verificar el tema al cargar el componente
        checkTheme();
        
        // Crear un observador que vigile los cambios en los atributos de <html>
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { 
            attributes: true, 
            attributeFilter: ['class'] 
        });

        // Limpiar el observador cuando el componente se desmonte
        return () => observer.disconnect();
    }, []); // El array vacío asegura que esto solo se ejecute al montar y desmontar

    // --------------------------------------------------------

    const handleExportar = () => {
        toast({
            title: "Reporte exportado",
            description: "El reporte ha sido descargado exitosamente.",
        })
    }

    const ingresosTotales = 187900, gastosTotales = 54450, beneficioNeto = ingresosTotales - gastosTotales;

    // Tooltip personalizado adaptado a los colores del tema
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover text-popover-foreground p-3 text-sm rounded-lg shadow-xl border border-border">
                    <p className="font-semibold">{label || payload[0].payload.nombre}</p>
                    {payload.map((p: any, i: number) => (
                        <p key={i} style={{ color: p.color }} className="mt-1">
                            {p.name}: {p.name.includes('Ingresos') || p.name.includes('Gastos') || p.name.includes('Monto') ? '$' : ''}{p.value.toLocaleString()}{p.name.includes('porcentaje') ? '%' : ''}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    // Colores de texto y rejilla para los gráficos, adaptados al tema
    // Estos se leen de las variables CSS de Tailwind
    const tickColor = "hsl(var(--muted-foreground))"
    const gridColor = "hsl(var(--border))"
    const cursorFill = "hsl(var(--muted) / 0.3)"

    return (
        <DashboardLayout title="Reportes y Estadísticas" menuItems={menuItems}>
            <div className="space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold">Análisis de Datos</h2>
                        <CardDescription>Visualiza el rendimiento del recorrido escolar</CardDescription>
                    </div>
                    <div className="flex gap-3">
                        <Select value={periodo} onValueChange={setPeriodo}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Seleccionar periodo" />
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

                {/* --- SECCIÓN CORREGIDA --- */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2 flex-row items-center justify-between">
                            <CardDescription>Ingresos Totales</CardDescription>
                            {/* // <-- CORRECCIÓN: Añadido dark:text-green-400 */}
                            <DollarSign className="w-4 h-4 text-green-500 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            {/* // <-- CORRECCIÓN: Añadido dark:text-green-400 */}
                            <div className="text-2xl font-bold text-green-500 dark:text-green-400">
                                ${ingresosTotales.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">+12% vs periodo anterior</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2 flex-row items-center justify-between">
                            <CardDescription>Gastos Totales</CardDescription>
                            {/* // <-- CORRECCIÓN: Añadido dark:text-pink-400 */}
                            <TrendingDown className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                        </CardHeader>
                        <CardContent>
                            {/* // <-- CORRECCIÓN: Añadido dark:text-pink-400 */}
                            <div className="text-2xl font-bold text-pink-500 dark:text-pink-400">
                                ${gastosTotales.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">+8% vs periodo anterior</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2 flex-row items-center justify-between">
                            <CardDescription>Beneficio Neto</CardDescription>
                            {/* // <-- CORRECCIÓN: Añadido dark:text-indigo-400 */}
                            <TrendingUp className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                        </CardHeader>
                        <CardContent>
                            {/* // <-- CORRECCIÓN: Añadido text-foreground */}
                            <div className="text-2xl font-bold text-foreground">
                                ${beneficioNeto.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Rentabilidad del 85%</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2 flex-row items-center justify-between">
                            <CardDescription>Alumnos Activos</CardDescription>
                            {/* // <-- CORRECCIÓN: Añadido dark:text-blue-400 */}
                            <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            {/* // <-- CORRECCIÓN: Añadido text-foreground */}
                            <div className="text-2xl font-bold text-foreground">
                                45
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">3 nuevos este mes</p>
                        </CardContent>
                    </Card>
                </div>
                {/* --- FIN SECCIÓN CORREGIDA --- */}


                <Tabs defaultValue="pagos" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="pagos">Pagos</TabsTrigger>
                        <TabsTrigger value="vehiculos">Finanzas por Recorrido</TabsTrigger>
                        <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
                        <TabsTrigger value="alumnos">Alumnos</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pagos" className="grid gap-4 lg:grid-cols-7">
                        <Card className="lg:col-span-4">
                            <CardHeader><CardTitle>Ingresos por Mes</CardTitle></CardHeader>
                            {/* --- CAMBIO 3: overflow-x-auto y minWidth --- */}
                            <CardContent className="h-[300px] p-4 pt-0 overflow-x-auto">
                                <ResponsiveContainer width="100%" height="100%" minWidth={300}>
                                    <BarChart data={pagosPorMes}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                        <XAxis dataKey="mes" stroke={tickColor} fontSize={12} />
                                        <YAxis stroke={tickColor} fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }}/>
                                        <Bar dataKey="monto" name="Monto" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-3">
                            <CardHeader><CardTitle>Estado de Pagos</CardTitle></CardHeader>
                            {/* --- CAMBIO 3: overflow-x-auto y minWidth --- */}
                            <CardContent className="h-[300px] p-4 pt-0 overflow-x-auto">
                                <ResponsiveContainer width="100%" height="100%" minWidth={250}>
                                    <PieChart>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Pie data={estadoPagos} dataKey="valor" nameKey="nombre" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, value }) => `${name}: ${value}`} >
                                            {estadoPagos.map((e, i) => <Cell key={`cell-${i}`} fill={e.color} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="vehiculos" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Rendimiento Histórico por Recorrido</CardTitle>
                                <CardDescription>Comparación de Ingresos vs. Gastos mensuales.</CardDescription>
                            </CardHeader>
                            {/* --- CAMBIO 3: overflow-x-auto y minWidth --- */}
                            <CardContent className="h-[400px] p-4 pt-0 overflow-x-auto">
                                <ResponsiveContainer width="100%" height="100%" minWidth={300}>
                                    <BarChart data={finanzasPorVehiculo}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                        <XAxis dataKey="mes" stroke={tickColor} fontSize={12} />
                                        <YAxis stroke={tickColor} fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }}/>
                                        <Bar dataKey="ingresosA" name="Ingresos Rec. A" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="gastosA" name="Gastos Rec. A" stackId="a" fill="#db2777" />
                                        <Bar dataKey="ingresosB" name="Ingresos Rec. B" stackId="b" fill="#3b82f6" radius={[4, 4, 0, 0]}/>
                                        <Bar dataKey="gastosB" name="Gastos Rec. B" stackId="b" fill="#ea580c" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="asistencia">
                        <Card>
                            <CardHeader><CardTitle>Porcentaje de Asistencia Mensual</CardTitle></CardHeader>
                            {/* --- CAMBIO 3: overflow-x-auto y minWidth --- */}
                            <CardContent className="h-[400px] p-4 pt-0 overflow-x-auto">
                                <ResponsiveContainer width="100%" height="100%" minWidth={300}>
                                    <BarChart data={asistenciaPorMes}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                        <XAxis dataKey="mes" stroke={tickColor} fontSize={12} />
                                        <YAxis domain={[0, 100]} stroke={tickColor} fontSize={12} tickFormatter={(v) => `${v}%`} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }}/>
                                        <Bar dataKey="porcentaje" name="Asistencia" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="alumnos">
                        <Card>
                            <CardHeader><CardTitle>Distribución de Alumnos por Grado</CardTitle></CardHeader>
                            {/* --- CAMBIO 3: overflow-x-auto y minWidth --- */}
                            <CardContent className="h-[400px] p-4 pt-0 overflow-x-auto">
                                <ResponsiveContainer width="100%" height="100%" minWidth={300}>
                                    <BarChart data={alumnosPorGrado} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                                        <XAxis type="number" stroke={tickColor} fontSize={12} />
                                        <YAxis dataKey="grado" type="category" width={100} stroke={tickColor} fontSize={12} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }}/>
                                        <Bar dataKey="alumnos" name="Alumnos" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}