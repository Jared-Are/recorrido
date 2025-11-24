"use client"

import { useState, useMemo, useEffect } from "react"
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
    Eye, 
    EyeOff,
    Users, 
    DollarSign, 
    Bus, 
    UserCog, 
    Bell, 
    BarChart3, 
    TrendingDown,
    Loader2,
    AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase" // <--- Importamos Supabase
import type { RequestInit } from "next/dist/server/web/spec-extension/request" // Para tipado de fetch

// --- TIPO GASTO (ACTUALIZADO) ---
export type Gasto = {
    id: string;
    descripcion: string;
    categoria: string;
    monto: number;
    fecha: string; 
    estado: "activo" | "inactivo" | "eliminado";
    vehiculoId: string | null;
    vehiculo?: { 
        id: string;
        nombre: string;
    }
    personalId: string | null;
    personal?: {
        id: string;
        nombre: string;
    }
};

// --- TIPO VEHÍCULO (PARA EL FILTRO) ---
type Vehiculo = {
    id: string;
    nombre: string;
};

// --- Menú (El mismo de siempre) ---
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

// Helper de formato de moneda
const formatCurrency = (num: number) => {
    return (num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// --- CONSTANTES PARA FILTROS ---
const CATEGORIAS_FILTRO = ["combustible", "mantenimiento", "salarios", "otros"];
const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function GastosPage() {
    const [gastos, setGastos] = useState<Gasto[]>([])
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [estadoFilter, setEstadoFilter] = useState("activo"); 
    const [categoriaFilter, setCategoriaFilter] = useState("combustible");
    const [vehiculoFilter, setVehiculoFilter] = useState("todos");
    const { toast } = useToast()

    // --- Cargar Gastos y Vehículos ---
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
            
            const [gastosRes, vehiculosRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/gastos?estado=${estadoFilter}`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos?estado=activo`, { headers })
            ]);
            
            // 1. Manejo de Gastos (CRÍTICO)
            if (!gastosRes.ok) {
                if (gastosRes.status === 404 || gastosRes.status === 204) {
                    setGastos([]);
                } else {
                    const errorData = await gastosRes.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error al cargar gastos (${gastosRes.status})`);
                }
            } else {
                setGastos(await gastosRes.json());
            }

            // 2. Manejo de Vehículos
            if (!vehiculosRes.ok) {
                 if (vehiculosRes.status === 404 || vehiculosRes.status === 204) {
                    setVehiculos([]);
                } else {
                    const errorData = await vehiculosRes.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error al cargar vehículos (${vehiculosRes.status})`);
                }
            } else {
                 setVehiculos(await vehiculosRes.json());
            }
            
        } catch (err: any) {
            setError(err.message);
            toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchDatos();
    }, [toast, estadoFilter]); 

    // --- Filtrar por Búsqueda (para la tabla) ---
    const filteredGastos = useMemo(() => {
        let filtrados = gastos.filter(
            (gasto) =>
                gasto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                gasto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (gasto.vehiculo && gasto.vehiculo.nombre.toLowerCase().includes(searchTerm.toLowerCase())) || 
                (gasto.personal && gasto.personal.nombre.toLowerCase().includes(searchTerm.toLowerCase())) 
        );
        
        // Aplicar filtros de tarjetas a la tabla (aunque las tarjetas usen un filtro distinto)
        if (categoriaFilter && categoriaFilter !== 'todos') {
             filtrados = filtrados.filter(g => g.categoria === categoriaFilter);
        }
        if (vehiculoFilter && vehiculoFilter !== 'todos') {
             filtrados = filtrados.filter(g => g.vehiculoId === vehiculoFilter);
        }
        
        return filtrados;

    }, [gastos, searchTerm, categoriaFilter, vehiculoFilter]);

    // --- Cálculos para Tarjetas ---
    const totalGastado = gastos.reduce((sum, g) => sum + (g.monto || 0), 0)
    
    const hoy = new Date()
    const mesActual = hoy.getFullYear() + "-" + String(hoy.getMonth() + 1).padStart(2, "0")
    const gastoDelMes = gastos
        .filter((g) => g.fecha.startsWith(mesActual))
        .reduce((sum, g) => sum + (g.monto || 0), 0)

    const gastoPorCategoria = useMemo(() => {
        const gastosFiltrados = gastos.filter(g => g.categoria === categoriaFilter);
        return gastosFiltrados.reduce((sum, g) => sum + (g.monto || 0), 0);
    }, [gastos, categoriaFilter]);

    const gastoCategoriaTitle = useMemo(() => {
        return `Total - ${capitalizar(categoriaFilter)}`;
    }, [categoriaFilter]);

    const gastoPorVehiculo = useMemo(() => {
        let gastosFiltrados = gastos;
        if (vehiculoFilter !== "todos") {
            gastosFiltrados = gastosFiltrados.filter(g => g.vehiculoId === vehiculoFilter);
        } else {
            gastosFiltrados = gastosFiltrados.filter(g => !!g.vehiculoId);
        }
        return gastosFiltrados.reduce((sum, g) => sum + (g.monto || 0), 0);
    }, [gastos, vehiculoFilter]);

    const gastoVehiculoTitle = useMemo(() => {
        if (vehiculoFilter === "todos") {
            return "Gasto Total (Vehículos)";
        }
        const vehiculo = vehiculos.find(v => v.id === vehiculoFilter);
        return `Gasto - ${vehiculo?.nombre || 'Vehículo'}`;
    }, [vehiculoFilter, vehiculos]);
    // --- FIN CÁLCULOS ---


    const getBadgeVariant = (categoria: string) => {
        switch (categoria) {
            case "combustible": return "destructive"
            case "mantenimiento": return "secondary"
            case "salarios": return "outline"
            default: return "default"
        }
    }

    const cambiarEstadoGasto = async (id: string, nuevoEstado: "activo" | "inactivo" | "eliminado") => {
        const gasto = gastos.find(g => g.id === id);
        if (!gasto) return;

        if (!window.confirm(`¿Estás seguro de mover el gasto "${gasto.descripcion}" a ${nuevoEstado}? Esta acción es permanente.`)) return;

        try {
             const { data: { session } } = await supabase.auth.getSession();
             const token = session?.access_token;
             if (!token) throw new Error("Sesión no válida.");

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gastos/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, // Envío de Token
                body: JSON.stringify({ estado: nuevoEstado }), 
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || "No se pudo actualizar el estado del gasto");
            }
            
            fetchDatos(); 

            let mensaje = "";
            if (nuevoEstado === "eliminado") mensaje = "Gasto eliminado correctamente";
            if (nuevoEstado === "inactivo") mensaje = "Gasto desactivado correctamente";
            if (nuevoEstado === "activo") mensaje = "Gasto activado correctamente";

            toast({
                title: "Estado actualizado",
                description: `${mensaje}: ${gasto?.descripcion}`,
            });

        } catch (err: any) {
            toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
        }
    }
    
    // --- MANEJO DE ESTADOS DE CARGA/ERROR ---
    if (loading) {
        return (
            <DashboardLayout title="Gestión de Gastos" menuItems={menuItems}>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="ml-3 text-muted-foreground">Cargando datos de gastos...</p>
                </div>
            </DashboardLayout>
        );
    }
    
    // Si hay error y no hay datos que mostrar
    if (error && gastos.length === 0) {
        return (
            <DashboardLayout title="Gestión de Gastos" menuItems={menuItems}>
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
        <DashboardLayout title="Gestión de Gastos" menuItems={menuItems}>
            <div className="space-y-6">

                {/* --- TARJETAS (AHORA 4 COLUMNAS) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-red-600">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs">
                                Gasto Total ({estadoFilter === 'activo' ? 'Activos' : 'Inactivos'})
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl md:text-2xl font-bold text-red-600">C${totalGastado.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs">Gasto de este Mes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl md:text-2xl font-bold text-orange-600">C${gastoDelMes.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    
                    {/* --- TARJETA DINÁMICA DE GASTO POR CATEGORÍA --- */}
                    <Card className="border-l-4 border-l-blue-600">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs">{gastoCategoriaTitle}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl md:text-2xl font-bold text-blue-600">C${gastoPorCategoria.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    {/* --- TARJETA DINÁMICA DE GASTO POR VEHÍCULO --- */}
                    <Card className="border-l-4 border-l-purple-600">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs">{gastoVehiculoTitle}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl md:text-2xl font-bold text-purple-600">C${gastoPorVehiculo.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                    <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 w-full"
                            />
                        </div>
                        <Select onValueChange={setEstadoFilter} value={estadoFilter}>
                            <SelectTrigger className="w-full sm:w-[160px]">
                                <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="activo">Activos</SelectItem>
                                <SelectItem value="inactivo">Inactivos</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* --- FILTRO DE CATEGORÍA --- */}
                        <Select onValueChange={setCategoriaFilter} value={categoriaFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Gasto por categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIAS_FILTRO.map(c => (
                                    <SelectItem key={c} value={c}>{capitalizar(c)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* --- FILTRO DE VEHÍCULO --- */}
                        <Select onValueChange={setVehiculoFilter} value={vehiculoFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Gasto por vehículo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Total (Solo Vehículos)</SelectItem>
                                {vehiculos.map(v => (
                                    <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Link href="/dashboard/propietario/gastos/nuevo" className="w-full sm:w-auto">
                        <Button className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Registrar Gasto
                        </Button>
                    </Link>
                </div>


                {/* --- MENSAJE DE TABLA VACÍA --- */}
                {gastos.length === 0 && !loading && (
                    <Card className="mt-6 border-l-4 border-l-pink-500">
                        <CardHeader>
                            <CardTitle>No hay gastos registrados</CardTitle>
                            <CardDescription>
                                Registra tu primer gasto de combustible, mantenimiento o salario.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/propietario/gastos/nuevo">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" /> Registrar Gasto
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}


                {/* --- TABLA --- */}
                {gastos.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Gastos ({estadoFilter === 'activo' ? 'Activos' : 'Inactivos'})</CardTitle>
                            <CardDescription>Registro de todos los gastos operativos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Descripción</TableHead>
                                            <TableHead>Categoría</TableHead>
                                            <TableHead>Vehículo</TableHead> 
                                            <TableHead>Personal</TableHead>
                                            <TableHead>Monto</TableHead>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead> 
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredGastos.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center h-24">No se encontraron gastos que coincidan con los filtros.</TableCell>
                                            </TableRow>
                                        )}
                                        {filteredGastos.map((gasto) => (
                                            <TableRow key={gasto.id}>
                                                <TableCell className="font-medium whitespace-nowrap">{gasto.descripcion}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getBadgeVariant(gasto.categoria)}>
                                                        {capitalizar(gasto.categoria)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">{gasto.vehiculo?.nombre || "N/A"}</TableCell>
                                                <TableCell className="whitespace-nowrap">{gasto.personal?.nombre || "N/A"}</TableCell>
                                                <TableCell className="whitespace-nowrap">C${formatCurrency(gasto.monto)}</TableCell>
                                                <TableCell className="whitespace-nowrap">{new Date(gasto.fecha + "T00:00:00").toLocaleDateString('es-NI')}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/dashboard/propietario/gastos/${gasto.id}`}>
                                                            <Button variant="ghost" size="icon" title="Editar">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        
                                                        {gasto.estado === "activo" ? (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon"
                                                                title="Desactivar"
                                                                onClick={() => cambiarEstadoGasto(gasto.id, "inactivo")}
                                                            >
                                                                <EyeOff className="h-4 w-4" />
                                                            </Button>
                                                        ) : (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon"
                                                                title="Activar"
                                                                onClick={() => cambiarEstadoGasto(gasto.id, "activo")}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            title="Eliminar (Mover a Papelera)"
                                                            onClick={() => cambiarEstadoGasto(gasto.id, "eliminado")}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}