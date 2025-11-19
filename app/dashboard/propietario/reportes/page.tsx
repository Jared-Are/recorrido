"use client"

import React, { useState, useEffect, useRef } from "react"
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
    Loader2
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
    Legend
} from "recharts"
// --- CAMBIO 1: IMPORTACIÓN NUEVA ---
import { toPng } from 'html-to-image'; // Usamos esto en vez de html2canvas
import jsPDF from "jspdf"

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

// --- MENÚ (Igual) ---
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

export default function ReportesPage() {
    const { toast } = useToast()
    const [periodo, setPeriodo] = useState("semestre")
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    
    const [exporting, setExporting] = useState(false)
    const reportRef = useRef<HTMLDivElement>(null)

    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reportes/dashboard`)
                if (!res.ok) throw new Error("Error al cargar reportes")
                const json = await res.json()
                setData(json)
            } catch (error) {
                console.error(error)
                toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" })
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [toast])

    useEffect(() => {
        const checkTheme = () => {
             const isDark = document.documentElement.classList.contains('dark');
             setIsDarkMode(isDark);
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // --- CAMBIO 2: LÓGICA ACTUALIZADA CON html-to-image ---
    const handleExportar = async () => {
        if (!reportRef.current) return;
        setExporting(true);
        try {
            const element = reportRef.current;
            
            // html-to-image maneja mejor los estilos modernos (incluido oklch)
            const dataUrl = await toPng(element, { 
                cacheBust: true,
                backgroundColor: isDarkMode ? '#020817' : '#ffffff' // Fondo forzado para evitar transparencias raras
            });

            // Configurar PDF (A4)
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgProps = pdf.getImageProperties(dataUrl);
            const imgWidth = imgProps.width;
            const imgHeight = imgProps.height;
            
            // Calcular ratio para ajustar al ancho de la página
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2; // Centrar horizontalmente
            const imgY = 10; // Margen superior

            pdf.addImage(dataUrl, 'PNG', 0, imgY, pdfWidth, imgHeight * (pdfWidth / imgWidth));
            
            pdf.save(`Reporte_Financiero_${new Date().toISOString().split('T')[0]}.pdf`);

            toast({
                title: "Reporte exportado",
                description: "El PDF se ha descargado exitosamente.",
            });
        } catch (error) {
            console.error("Error exportando PDF:", error);
            toast({ title: "Error", description: "No se pudo generar el PDF.", variant: "destructive" });
        } finally {
            setExporting(false);
        }
    }
    // ------------------------------------------------------

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover text-popover-foreground p-3 text-sm rounded-lg shadow-xl border border-border">
                    <p className="font-semibold mb-2">{label || payload[0].payload.nombre}</p>
                    {payload.map((p: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                            <div style={{ width: 8, height: 8, backgroundColor: p.color, borderRadius: '50%' }} />
                            <span className="capitalize">
                                {p.name}: {['ingreso', 'gasto', 'monto', 'ingresos', 'gastos', 'valor'].some(k => p.dataKey.toLowerCase().includes(k) || p.name.toLowerCase().includes(k)) ? 'C$' : ''}{Number(p.value).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    const tickColor = "hsl(var(--muted-foreground))"
    const gridColor = "hsl(var(--border))"
    const cursorFill = "hsl(var(--muted) / 0.3)"

    if (loading) {
        return (
            <DashboardLayout title="Reportes" menuItems={menuItems}>
                 <div className="flex justify-center items-center h-96">
                    <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                 </div>
            </DashboardLayout>
        )
    }

    if (!data) return null;

    return (
        <DashboardLayout title="Reportes y Estadísticas" menuItems={menuItems}>
            <div className="space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold">Análisis Financiero</h2>
                        <CardDescription>Rendimiento en tiempo real del sistema.</CardDescription>
                    </div>
                    <div className="flex gap-3">
                        <Select value={periodo} onValueChange={setPeriodo}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Periodo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semestre">Últimos 6 meses</SelectItem>
                                <SelectItem value="anio">Último año</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleExportar} disabled={exporting}>
                            {exporting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4 mr-2" />
                            )}
                            {exporting ? "Generando PDF..." : "Exportar PDF"}
                        </Button>
                    </div>
                </div>

                {/* --- CONTENEDOR CAPTURABLE PARA PDF --- */}
                <div ref={reportRef} id="reporte-content" className="space-y-6 p-1 bg-background">
                    
                    {/* --- KPI CARDS --- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between">
                                <CardDescription>Ingresos Totales</CardDescription>
                                <DollarSign className="w-4 h-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    C$ {data.kpi.ingresosTotales.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Histórico acumulado</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between">
                                <CardDescription>Gastos Totales</CardDescription>
                                <TrendingDown className="w-4 h-4 text-pink-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                                    C$ {data.kpi.gastosTotales.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Histórico acumulado</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between">
                                <CardDescription>Beneficio Neto</CardDescription>
                                <TrendingUp className="w-4 h-4 text-indigo-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                    C$ {data.kpi.beneficioNeto.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Ingresos - Gastos</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between">
                                <CardDescription>Alumnos Activos</CardDescription>
                                <Users className="w-4 h-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    {/* Sumamos la cantidad de alumnos de la gráfica de grados */}
                                    {data.alumnosPorGrado.reduce((acc: number, curr: any) => acc + curr.alumnos, 0)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Total matriculados</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="general" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="general">Finanzas General</TabsTrigger>
                            <TabsTrigger value="vehiculos">Rentabilidad por Unidad</TabsTrigger>
                            <TabsTrigger value="pagos">Estado de Pagos</TabsTrigger>
                            <TabsTrigger value="alumnos">Demografía</TabsTrigger>
                        </TabsList>
                        
                        {/* PESTAÑA 1: INGRESOS VS GASTOS */}
                        <TabsContent value="general">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Balance Mensual</CardTitle>
                                    <CardDescription>Comparativa de Ingresos vs Gastos</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.finanzasPorMes}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                            <XAxis dataKey="mes" stroke={tickColor} fontSize={12} />
                                            <YAxis stroke={tickColor} fontSize={12} tickFormatter={(v) => `C$${v/1000}k`} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }}/>
                                            <Legend />
                                            <Bar dataKey="ingreso" name="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="gasto" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* PESTAÑA 2: VEHÍCULOS */}
                        <TabsContent value="vehiculos">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Rentabilidad por Unidad</CardTitle>
                                    <CardDescription>Comparativa histórica de Ingresos Generados vs. Gastos Operativos por vehículo.</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[400px] w-full p-4 pt-0 overflow-x-auto">
                                    <ResponsiveContainer width="100%" height="100%" minWidth={500}>
                                        <BarChart data={data.finanzasPorVehiculo}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                            <XAxis dataKey="nombre" stroke={tickColor} fontSize={12} />
                                            <YAxis stroke={tickColor} fontSize={12} tickFormatter={(v) => `C$${v/1000}k`} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }}/>
                                            <Legend />
                                            <Bar dataKey="ingresos" name="Ingresos Generados" fill="#10b981" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="gastos" name="Gastos Operativos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* PESTAÑA 3: DONA DE PAGOS */}
                        <TabsContent value="pagos">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Estado de Cartera</CardTitle>
                                    <CardDescription>Proporción de pagos al día vs pendientes (Global)</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[400px] w-full flex justify-center">
                                    <ResponsiveContainer width="100%" height="100%" minWidth={300}>
                                        <PieChart>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend verticalAlign="bottom" height={36}/>
                                            <Pie 
                                                data={data.estadoPagos} 
                                                dataKey="valor" 
                                                nameKey="nombre" 
                                                cx="50%" 
                                                cy="50%" 
                                                innerRadius={80} 
                                                outerRadius={120} 
                                                paddingAngle={2}
                                            >
                                                {data.estadoPagos.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                        {/* PESTAÑA 4: ALUMNOS POR GRADO */}
                        <TabsContent value="alumnos">
                            <Card>
                                <CardHeader><CardTitle>Distribución por Grado</CardTitle></CardHeader>
                                <CardContent className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.alumnosPorGrado} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                                            <XAxis type="number" stroke={tickColor} />
                                            <YAxis dataKey="grado" type="category" width={100} stroke={tickColor} fontSize={12} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }}/>
                                            <Bar dataKey="alumnos" name="Cantidad" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={30} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                    </Tabs>
                </div>
            </div>
        </DashboardLayout>
    )
}