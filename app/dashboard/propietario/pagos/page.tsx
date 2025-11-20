"use client"

import { useState, useMemo, useEffect } from "react"
import React from "react"
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
    Plus, 
    Search, 
    Pencil,
    Trash2,
    Users, 
    DollarSign, 
    Bus, 
    UserCog, 
    Bell, 
    BarChart3, 
    TrendingDown,
    List, 
    LayoutGrid,
    Loader2,
    AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase" // <--- Importamos Supabase

// --- DEFINICIÓN DE TIPOS ---
export type Pago = {
    id: string;
    alumnoId: string;
    alumnoNombre: string; 
    monto: number; // Forzaremos la conversión por si llega como string
    mes: string;
    fecha: string; 
    estado: "pagado" | "pendiente";
};

export type Alumno = {
    id: string;
    nombre: string;
    tutor: string;
    grado: string;
    precio?: number; // Forzaremos la conversión por si llega como string
    activo: boolean; 
};


// --- DEFINICIÓN DEL MENÚ COMPLETO (omitted for brevity) ---
const menuItems: MenuItem[] = [
    { title: "Gestionar Alumnos", description: "Ver y administrar estudiantes", icon: Users, href: "/dashboard/propietario/alumnos", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Gestionar Pagos", description: "Ver historial y registrar pagos", icon: DollarSign, href: "/dashboard/propietario/pagos", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20" },
    { title: "Gestionar Gastos", description: "Control de combustible, salarios, etc.", icon: TrendingDown, href: "/dashboard/propietario/gastos", color: "text-pink-600", bgColor: "bg-pink-50 dark:bg-pink-900/20" },
    { title: "Gestionar Personal", description: "Administrar empleados y choferes", icon: Users, href: "/dashboard/propietario/personal", color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
    { title: "Gestionar Vehículos", description: "Administrar flota de vehículos", icon: Bus, href: "/dashboard/propietario/vehiculos", color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
    { title: "Gestionar Usuarios", description: "Administrar accesos al sistema", icon: UserCog, href: "/dashboard/propietario/usuarios", color: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-900/20" },
    { title: "Enviar Avisos", description: "Comunicados a tutores y personal", icon: Bell, href: "/dashboard/propietario/avisos", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
    { title: "Generar Reportes", description: "Estadísticas y análisis", icon: BarChart3, href: "/dashboard/propietario/reportes", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20" },
];


// --- CONSTANTES PARA LA VISTA DE CUADERNO ---
const ANIO_ESCOLAR = new Date().getFullYear().toString(); 
const MES_DICIEMBRE = `Diciembre ${ANIO_ESCOLAR}`; 
const MESES_CUADERNO = [
    "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
].map(mes => `${mes} ${ANIO_ESCOLAR}`);

// --- CONSTANTE PARA EL FILTRO DE TARJETAS ---
const MESES_FILTRO = ["Todos", ...MESES_CUADERNO];

const GRADO_ORDER = [
    "1° Preescolar", "2° Preescolar", "3° Preescolar",
    "1° Primaria", "2° Primaria", "3° Primaria",
    "4° Primaria", "5° Primaria", "6° Primaria"
];

const formatCurrency = (num: number) => {
    return (num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


export default function PagosPage() {
    const [pagos, setPagos] = useState<Pago[]>([]) 
    const [alumnos, setAlumnos] = useState<Alumno[]>([]) 
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()
    
    const [searchTerm, setSearchTerm] = useState("")
    
    const [cardMonthFilter, setCardMonthFilter] = useState("Todos");
    
    const [viewMode, setViewMode] = useState<'lista' | 'cuaderno'>('lista');

    // --- OBTENER DATOS DE LA API ---
    const fetchDatos = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Sesión no válida o expirada.");

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            
            const [pagosRes, alumnosRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/pagos`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos`, { headers })
            ]);

            // Manejo de Pagos: CRÍTICO (404/204 -> [])
            if (!pagosRes.ok) {
                if (pagosRes.status === 404 || pagosRes.status === 204) {
                    setPagos([]);
                } else {
                    const errorData = await pagosRes.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error al cargar pagos (${pagosRes.status})`);
                }
            } else {
                 const pagosData: Pago[] = await pagosRes.json();
                 setPagos(pagosData);
            }
            
            // Manejo de Alumnos: CRÍTICO (404/204 -> [])
            if (!alumnosRes.ok) {
                 if (alumnosRes.status === 404 || alumnosRes.status === 204) {
                    setAlumnos([]);
                } else {
                    const errorData = await alumnosRes.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error al cargar alumnos (${alumnosRes.status})`);
                }
            } else {
                const alumnosData: Alumno[] = await alumnosRes.json();
                setAlumnos(alumnosData.filter(a => a.activo)); 
            }
            
        } catch (err: any) {
            setError(err.message);
            toast({
                title: "Error al cargar datos",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchDatos();
    }, [toast]);

    // --- LÓGICA DE FILTRADO (Para la 'Vista de Lista') ---
    const filteredPagos = useMemo(() => {
        let pagosFiltrados = [...pagos];

        if (cardMonthFilter !== "Todos") {
            pagosFiltrados = pagosFiltrados.filter(p => p.mes === cardMonthFilter);
        }

        if (searchTerm) {
            pagosFiltrados = pagosFiltrados.filter(
                (pago) =>
                    pago.alumnoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    pago.mes.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }
        pagosFiltrados.sort((a, b) => {
            const dateA = a.fecha ? new Date(a.fecha).getTime() : 0;
            const dateB = b.fecha ? new Date(b.fecha).getTime() : 0;
            return dateB - dateA;
        });
        return pagosFiltrados;
    }, [pagos, searchTerm, cardMonthFilter]);

    // --- LÓGICA DE DATOS (Para la 'Vista de Cuaderno') ---
    const cuadernoData = useMemo(() => {
        
        const pagosMap = new Map<string, Map<string, { 
            fechaSimple: string | null, 
            abonos: { fecha: string, monto: number }[],
            totalAbonado: number, 
        }>>();

        for (const pago of pagos) {
            if (pago.estado !== 'pagado' || !pago.fecha) continue;

            if (!pagosMap.has(pago.alumnoId)) {
                pagosMap.set(pago.alumnoId, new Map());
            }
            
            const fechaParts = pago.fecha.split('-'); 
            const fechaFormateada = `${fechaParts[2]}/${fechaParts[1]}`; 

            if (!pagosMap.get(pago.alumnoId)!.has(pago.mes)) {
                pagosMap.get(pago.alumnoId)!.set(pago.mes, { 
                    fechaSimple: null, 
                    abonos: [], 
                    totalAbonado: 0 
                });
            }

            const mesData = pagosMap.get(pago.alumnoId)!.get(pago.mes)!;
            
            const montoNumerico = Number(pago.monto) || 0; 

            if (pago.mes === MES_DICIEMBRE) {
                mesData.abonos.push({ fecha: fechaFormateada, monto: montoNumerico });
                mesData.totalAbonado += montoNumerico;
            } else {
                mesData.fechaSimple = fechaFormateada;
            }
        }

        let data = alumnos.map(alumno => {
            const pagosDelAlumno = pagosMap.get(alumno.id) || new Map();
            return {
                ...alumno, 
                meses: MESES_CUADERNO.map(mes => {
                    const mesData = pagosDelAlumno.get(mes) || { fechaSimple: null, abonos: [], totalAbonado: 0 };
                    
                    const precio = Number(alumno.precio) || 0; 

                    let esDiciembrePagado = false;
                    if (mes === MES_DICIEMBRE) {
                        esDiciembrePagado = mesData.totalAbonado >= (precio - 0.01);
                    }

                    return {
                        mes: mes, 
                        ...mesData,
                        esDiciembrePagado,
                    };
                })
            };
        });

        data = data.filter(a => a.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const grouped = data.reduce((acc, alumno) => {
            const grado = alumno.grado || "Sin Grado"; 
            if (!acc[grado]) {
                acc[grado] = [];
            }
            acc[grado].push(alumno);
            return acc;
        }, {} as Record<string, typeof data>); 

        const sortedGroupKeys = Object.keys(grouped).sort((a, b) => {
            const indexA = GRADO_ORDER.indexOf(a);
            const indexB = GRADO_ORDER.indexOf(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

        return { grouped, sortedGroupKeys }; 

    }, [alumnos, pagos, searchTerm]); 


    // --- CÁLCULOS (MODIFICADOS PARA FILTRO DE TARJETAS) ---
    const pagosParaTarjetas = useMemo(() => {
        if (cardMonthFilter === "Todos") {
            return pagos;
        }
        return pagos.filter(p => p.mes === cardMonthFilter);
    }, [pagos, cardMonthFilter]);

    const totalPagado = useMemo(() => 
        pagosParaTarjetas
            .filter((p) => p.estado === "pagado")
            .reduce((sum, p) => sum + (Number(p.monto) || 0), 0),
    [pagosParaTarjetas]);
    
    // --- LÓGICA DE "PENDIENTE" CORREGIDA ---
    const totalPendiente = useMemo(() => {
        // 1. Total teórico de TODOS los alumnos (precio * 11 meses)
        const totalTeoricoAnual = alumnos.reduce((sum, alumno) => {
            return sum + (Number(alumno.precio) || 0) * 11; 
        }, 0);

        // 2. Total pagado de TODO el año (SOLO DE ESTE AÑO)
        const totalPagadoAnual = pagos
            .filter(p => p.estado === 'pagado' && p.mes.includes(ANIO_ESCOLAR)) 
            .reduce((sum, p) => sum + (Number(p.monto) || 0), 0);

        // Lógica por Mes
        if (cardMonthFilter !== "Todos") {
            const totalTeoricoDelMes = alumnos.reduce((sum, alumno) => sum + (Number(alumno.precio) || 0), 0);
            
            const totalPagadoEseMes = pagos
                .filter(p => p.mes === cardMonthFilter && p.estado === 'pagado')
                .reduce((sum, p) => sum + (Number(p.monto) || 0), 0);
            
            const saldo = totalTeoricoDelMes - totalPagadoEseMes;
            return saldo < 0 ? 0 : saldo;
        }

        // Lógica General ("Todos"): Deuda total del año
        const saldoAnual = totalTeoricoAnual - totalPagadoAnual;
        return saldoAnual < 0 ? 0 : saldoAnual;

    }, [pagos, alumnos, cardMonthFilter, ANIO_ESCOLAR]);
    
    const totalRegistros = useMemo(() =>
        pagosParaTarjetas.length,
    [pagosParaTarjetas]);

    // --- BORRAR PAGO CON API ---
    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Estás seguro de ELIMINAR este registro de pago? Esta acción es permanente.")) {
            return;
        }
        try {
            // OBTENER TOKEN
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Sesión no válida.");

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pagos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error("No se pudo eliminar el pago.");
            }
            fetchDatos(); // Recargar datos para reflejar el cambio
            toast({
                title: "Pago Eliminado",
                description: "El registro del pago ha sido eliminado.",
            });
        } catch (err: any) {
            toast({
                title: "Error al eliminar",
                description: err.message,
                variant: "destructive",
            });
        }
    };

    // --- MANEJO DE ESTADOS DE CARGA/ERROR ---
    if (loading) {
        return (
            <DashboardLayout title="Gestión de Pagos" menuItems={menuItems}>
                <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
            </DashboardLayout>
        );
    }
    
    // Si hay error y no hay datos que mostrar
    if (error && pagos.length === 0 && alumnos.length === 0) {
        return (
            <DashboardLayout title="Gestión de Pagos" menuItems={menuItems}>
                <div className="flex flex-col justify-center items-center h-64 text-center p-6 bg-red-50 rounded-lg border border-red-100">
                    <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-red-700 mb-2">Error al cargar datos iniciales</h3>
                    <p className="text-muted-foreground max-w-md">{error}</p>
                    <Button className="mt-4" onClick={fetchDatos}>
                        Intentar de nuevo
                    </Button>
                </div>
            </DashboardLayout>
        );
    }


    // --- RENDERIZADO PRINCIPAL ---
    return (
        <DashboardLayout title="Gestión de Pagos" menuItems={menuItems}>
            <div className="space-y-6">
                
                {/* --- NUEVO FILTRO DE MES PARA TARJETAS --- */}
                <div className="flex justify-between items-center">
                    
                    <Select onValueChange={setCardMonthFilter} value={cardMonthFilter}>
                        <SelectTrigger className="w-full md:w-[240px]">
                            <SelectValue placeholder="Filtrar totales por mes" />
                        </SelectTrigger>
                        <SelectContent>
                            {MESES_FILTRO.map(mes => (
                                <SelectItem key={mes} value={mes}>
                                    {mes === "Todos" ? "Totales (Todo el Año)" : mes}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* --- TARJETAS DE RESUMEN (grid-cols-3) --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-2"><CardDescription className="text-xs">Total Pagado</CardDescription></CardHeader>
                        <CardContent><div className="text-xl md:text-2xl font-bold text-green-600">C${totalPagado.toLocaleString()}</div></CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs">
                                {cardMonthFilter === "Todos" ? "Total Pendiente (Anual)" : `Pendiente (${cardMonthFilter.split(" ")[0]})`}
                            </CardDescription> 
                        </CardHeader>
                        <CardContent><div className="text-xl md:text-2xl font-bold text-orange-600">C${totalPendiente.toLocaleString()}</div></CardContent>
                    </Card>
                    <Card className="flex items-center justify-center p-4 border-l-4 border-l-blue-500">
                         <Link href="/dashboard/propietario/pagos/nuevo" className="w-full">
                            <Button className="w-full h-12 text-base">
                                <Plus className="h-5 w-5 mr-2" />
                                Registrar Pago
                            </Button>
                        </Link>
                    </Card>
                </div>

                {/* --- CONTROLES DE BÚSQUEDA Y ACCIÓN --- */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por alumno..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-full"
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setViewMode(viewMode === 'lista' ? 'cuaderno' : 'lista')}
                            className="w-full sm:w-auto"
                            title={viewMode === 'lista' ? "Cambiar a Vista de Resumen Anual" : "Cambiar a Vista de Historial"}
                        >
                            {viewMode === 'lista' ? 
                                <LayoutGrid className="h-4 w-4 mr-2" /> : 
                                <List className="h-4 w-4 mr-2" />
                            }
                            {viewMode === 'lista' ? 'Ver Resumen' : 'Ver Historial'}
                        </Button>
                        {/* Botón flotante solo para lista, el de nuevo pago ya está en la tarjeta */}
                    </div>
                </div>

                {/* --- MENSAJE DE TABLA VACÍA --- */}
                {pagos.length === 0 && alumnos.length > 0 && !loading && viewMode === 'lista' && (
                    <Card className="mt-6 border-l-4 border-l-green-500">
                        <CardHeader>
                            <CardTitle>No hay transacciones registradas</CardTitle>
                            <CardDescription>
                                Comienza registrando un pago para el mes actual.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/propietario/pagos/nuevo">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" /> Registrar Primer Pago
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}


                {/* --- RENDERIZADO CONDICIONAL DE LA TABLA --- */}
                <Card>
                    {viewMode === 'lista' ? (
                        <>
                            {/* --- VISTA DE LISTA --- */}
                            <CardHeader>
                                <CardTitle>Historial de Transacciones</CardTitle>
                                <CardDescription>
                                    Cada pago individual. La lista se filtra por el mes seleccionado arriba.
                                </CardDescription>
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
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredPagos.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                        No se encontraron pagos con esos filtros.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredPagos.map((pago) => (
                                                    <TableRow key={pago.id}>
                                                        <TableCell className="font-medium whitespace-nowrap">{pago.alumnoNombre}</TableCell>
                                                        <TableCell className="whitespace-nowrap">{pago.mes}</TableCell>
                                                        <TableCell className="whitespace-nowrap">C${formatCurrency(Number(pago.monto))}</TableCell>
                                                        <TableCell className="whitespace-nowrap">{pago.fecha ? new Date(pago.fecha + 'T00:00:00').toLocaleDateString('es-NI') : "-"}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Link href={`/dashboard/propietario/pagos/${pago.id}`}>
                                                                    <Button variant="ghost" size="icon" title="Editar">
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                </Link>
                                                                <Button variant="ghost" size="icon" title="Eliminar" onClick={() => handleDelete(pago.id)}>
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </>
                    ) : (
                        <>
                            {/* --- VISTA DE CUADERNO (Resumen Anual) --- */}
                            <CardHeader>
                                <CardTitle>Resumen Anual (Vista Cuaderno)</CardTitle>
                                <CardDescription>
                                    Fechas de pago registradas por alumno para el año {ANIO_ESCOLAR}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {alumnos.length === 0 ? (
                                     <div className="text-center py-8 text-muted-foreground">No hay alumnos activos para mostrar el resumen anual.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table className="min-w-[1200px] md:min-w-[1400px]"> 
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[160px] min-w-[160px] md:w-[200px] md:min-w-[200px]">
                                                        Alumno
                                                    </TableHead>
                                                    <TableHead className="w-[100px] min-w-[100px] md:w-[120px] md:min-w-[120px]">
                                                        Mensualidad
                                                    </TableHead>
                                                    {MESES_CUADERNO.map(mes => (
                                                        <TableHead key={mes} className="text-center w-[100px]">
                                                            {mes.split(" ")[0]} 
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>{
                                                cuadernoData.sortedGroupKeys.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={13} className="text-center text-muted-foreground">
                                                            No se encontraron alumnos con ese término de búsqueda.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    cuadernoData.sortedGroupKeys.map(grado => (
                                                        <React.Fragment key={grado}>
                                                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                                                <TableCell colSpan={13} className="bg-muted/50 font-semibold text-sm">
                                                                    {grado}
                                                                </TableCell>
                                                            </TableRow>
                                                            {cuadernoData.grouped[grado].map((alumno) => (
                                                                <TableRow key={alumno.id}>
                                                                    <TableCell className="font-medium w-[160px] min-w-[160px] md:w-[200px] md:min-w-[200px]">
                                                                        {alumno.nombre}
                                                                    </TableCell>
                                                                    <TableCell className="font-medium w-[100px] min-w-[100px] md:w-[120px] md:min-w-[120px]">
                                                                        C$ {formatCurrency(Number(alumno.precio) || 0)}
                                                                    </TableCell>
                                                                    {alumno.meses.map((mesData: { 
                                                                        mes: string, 
                                                                        fechaSimple: string | null, 
                                                                        abonos: { fecha: string, monto: number }[],
                                                                        esDiciembrePagado: boolean,
                                                                    }) => (
                                                                        <TableCell key={mesData.mes} className="text-center align-top">
                                                                            {mesData.mes === MES_DICIEMBRE ? (
                                                                                // --- LÓGICA DE DICIEMBRE ---
                                                                                mesData.abonos.length > 0 ? (
                                                                                    <div className="flex flex-col gap-1 items-center">
                                                                                        {mesData.abonos.map((abono: { fecha: string, monto: number }, idx: number) => (
                                                                                            <Badge 
                                                                                                key={idx} 
                                                                                                variant={mesData.esDiciembrePagado ? "default" : "secondary"} 
                                                                                                className="text-xs whitespace-nowrap"
                                                                                            >
                                                                                                {abono.fecha} - C${formatCurrency(abono.monto)}
                                                                                            </Badge>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <span className="text-muted-foreground">-</span>
                                                                                )
                                                                            ) : (
                                                                                // Lógica Meses Regulares (Feb-Nov)
                                                                                mesData.fechaSimple ? (
                                                                                    <Badge variant="default">{mesData.fechaSimple}</Badge>
                                                                                ) : (
                                                                                    <span className="text-muted-foreground">-</span>
                                                                                )
                                                                            )}
                                                                        </TableCell>
                                                                    ))}
                                                                </TableRow>
                                                            ))}
                                                        </React.Fragment>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    )
    
}