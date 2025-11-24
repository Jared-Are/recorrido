"use client"

import { useState, useEffect, useRef } from "react"
import {
    Download, TrendingUp, Users, DollarSign, TrendingDown,
    Bus, UserCog, Bell, BarChart3, Loader2, AlertTriangle,
    Wallet
} from "lucide-react"
import {
    Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis,
    CartesianGrid, ResponsiveContainer, Tooltip, Legend
} from "recharts"
import { toPng } from 'html-to-image';
import jsPDF from "jspdf"

import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
    Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

// --- MENÚ ---
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

// Colores para gráficas
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ReportesPage() {
    const { toast } = useToast()
    const [periodo, setPeriodo] = useState("anio")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<any>(null)
    
    const [exporting, setExporting] = useState(false)
    const reportRef = useRef<HTMLDivElement>(null)

    const [isDarkMode, setIsDarkMode] = useState(false);

    // --- DETECCIÓN DE TEMA (MutationObserver) ---
    useEffect(() => {
        const checkTheme = () => {
             // Verificamos si la clase 'dark' está presente en <html>
             const isDark = document.documentElement.classList.contains('dark');
             setIsDarkMode(isDark);
        };
        
        // Chequeo inicial
        checkTheme();

        // Observar cambios en el atributo 'class' del elemento <html>
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        
        return () => observer.disconnect();
    }, []);

    // --- CARGA DE DATOS ---
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Sesión no válida.");

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reportes/dashboard`, { headers });
            
            if (!res.ok) {
                 if (res.status === 404 || res.status === 204) {
                    setData({}); 
                } else {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error del servidor (${res.status})`);
                }
            } else {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error(error);
            setError((error as Error).message);
            toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
        fetchData();
    }, [toast])


    // --- EXPORTAR PDF ---
    const handleExportar = async () => {
        if (!reportRef.current) return;
        setExporting(true);
        try {
            const element = reportRef.current;
            const dataUrl = await toPng(element, { 
                cacheBust: true,
                backgroundColor: isDarkMode ? '#020817' : '#ffffff' 
            });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(dataUrl);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(dataUrl, 'PNG', 0, 10, pdfWidth, imgHeight);
            pdf.save(`Reporte_Recorrido_${new Date().toISOString().split('T')[0]}.pdf`);

            toast({ title: "Reporte exportado", description: "Descarga iniciada." });
        } catch (error) {
            console.error("Error PDF:", error);
            toast({ title: "Error", description: "No se pudo generar el PDF.", variant: "destructive" });
        } finally {
            setExporting(false);
        }
    }

    // --- ESTILOS DINÁMICOS PARA GRÁFICAS ---
    // Usamos HEX explícitos para asegurar que Recharts los renderice bien
    const chartTheme = {
        textColor: isDarkMode ? "#94a3b8" : "#64748b", // Slate-400 (Dark) vs Slate-500 (Light)
        gridColor: isDarkMode ? "#334155" : "#e2e8f0", // Slate-700 (Dark) vs Slate-200 (Light)
        tooltipBg: isDarkMode ? "#1e293b" : "#ffffff", // Slate-900 (Dark) vs White (Light)
        tooltipBorder: isDarkMode ? "#475569" : "#e2e8f0",
        tooltipText: isDarkMode ? "#f8fafc" : "#0f172a"
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div 
                    className="p-3 text-sm rounded-lg shadow-xl border"
                    style={{ 
                        backgroundColor: chartTheme.tooltipBg, 
                        borderColor: chartTheme.tooltipBorder,
                        color: chartTheme.tooltipText
                    }}
                >
                    <p className="font-semibold mb-2">{label || payload[0].payload.nombre || payload[0].name}</p>
                    {payload.map((p: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                            <div style={{ width: 8, height: 8, backgroundColor: p.color, borderRadius: '50%' }} />
                            <span className="capitalize">
                                {p.name}: {['ingreso', 'gasto', 'monto', 'ingresos', 'gastos', 'valor'].some(k => p.dataKey?.toLowerCase().includes(k) || p.name?.toLowerCase().includes(k)) ? 'C$ ' : ''}
                                {Number(p.value).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    if (loading) {
        return (
            <DashboardLayout title="Reportes" menuItems={menuItems}>
                <div className="flex justify-center items-center h-96">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        )
    }

    if (error || !data || Object.keys(data).length === 0) {
        return (
            <DashboardLayout title="Reportes" menuItems={menuItems}>
                 <div className="flex flex-col justify-center items-center h-96 text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100">
                    <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Sin datos suficientes</h3>
                    <p className="text-muted-foreground max-w-md mb-4">
                        {error ? `Error: ${error}` : "Registra alumnos, pagos y gastos para ver las estadísticas."}
                    </p>
                    <Button onClick={fetchData}>Recargar</Button>
                </div>
            </DashboardLayout>
        );
    }
    
    const totalAlumnos = data.kpi?.alumnosActivos || 0;
    // Cálculo simple de deuda estimada (si tu backend no lo manda, lo aproximamos)
    // Si el backend lo manda en 'kpi', úsalo. Si no, omítelo o calcúlalo localmente.
    const deudaEstimada = 0; 

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
                                <SelectItem value="anio">Año Actual</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleExportar} disabled={exporting}>
                            {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                            {exporting ? "Generando..." : "Exportar PDF"}
                        </Button>
                    </div>
                </div>

                {/* --- CONTENEDOR PDF --- */}
                <div ref={reportRef} id="reporte-content" className="space-y-6 p-1 bg-background text-foreground">
                    
                    {/* KPI CARDS */}
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
                                <p className="text-xs text-muted-foreground mt-1">Operativos y Mantenimiento</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 flex-row items-center justify-between">
                                <CardDescription>Utilidad Neta</CardDescription>
                                <Wallet className="w-4 h-4 text-indigo-500" />
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
                                    {totalAlumnos}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Matrícula actual</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="general" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="general">Finanzas General</TabsTrigger>
                            <TabsTrigger value="vehiculos">Rentabilidad x Unidad</TabsTrigger>
                            <TabsTrigger value="pagos">Estado de Cartera</TabsTrigger>
                            <TabsTrigger value="alumnos">Demografía</TabsTrigger>
                        </TabsList>
                        
                        {/* GRÁFICA 1: BARRAS FINANCIERAS */}
                        <TabsContent value="general">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Balance Mensual</CardTitle>
                                    <CardDescription>Ingresos vs Gastos por mes</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.finanzasPorMes}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
                                            <XAxis dataKey="mes" stroke={chartTheme.textColor} fontSize={12} />
                                            <YAxis stroke={chartTheme.textColor} fontSize={12} tickFormatter={(v) => `C$${v/1000}k`} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDarkMode ? '#33415540' : '#f1f5f980' }}/>
                                            <Legend />
                                            <Bar dataKey="ingreso" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="gasto" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* GRÁFICA 2: VEHÍCULOS */}
                        <TabsContent value="vehiculos">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Rentabilidad por Vehículo</CardTitle>
                                    <CardDescription>Rendimiento financiero por unidad de transporte</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[400px] w-full overflow-x-auto">
                                    <ResponsiveContainer width="100%" height="100%" minWidth={500}>
                                        <BarChart data={data.finanzasPorVehiculo}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.gridColor} />
                                            <XAxis dataKey="nombre" stroke={chartTheme.textColor} fontSize={12} />
                                            <YAxis stroke={chartTheme.textColor} fontSize={12} tickFormatter={(v) => `C$${v/1000}k`} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDarkMode ? '#33415540' : '#f1f5f980' }}/>
                                            <Legend />
                                            <Bar dataKey="ingresos" name="Generado" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="gastos" name="Gastado" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* GRÁFICA 3: DONA DE PAGOS */}
                        <TabsContent value="pagos">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Estado de Pagos</CardTitle>
                                    <CardDescription>Porcentaje de cumplimiento mensual</CardDescription>
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
                                                stroke="none"
                                            >
                                                {data.estadoPagos?.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                        {/* GRÁFICA 4: BARRAS ALUMNOS */}
                        <TabsContent value="alumnos">
                            <Card>
                                <CardHeader><CardTitle>Alumnos por Grado</CardTitle></CardHeader>
                                <CardContent className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.alumnosPorGrado} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartTheme.gridColor} />
                                            <XAxis type="number" stroke={chartTheme.textColor} />
                                            <YAxis dataKey="grado" type="category" width={100} stroke={chartTheme.textColor} fontSize={12} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDarkMode ? '#33415540' : '#f1f5f980' }}/>
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