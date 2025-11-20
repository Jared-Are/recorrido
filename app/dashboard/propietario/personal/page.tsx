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

// --- TIPO PERSONAL (ACTUALIZADO) ---
export type Personal = {
    id: string;
    nombre: string;
    puesto: string;
    contacto: string;
    salario: number;
    fechaContratacion: string; 
    estado: "activo" | "inactivo" | "eliminado";
    vehiculoId: string | null;
    vehiculo?: { // El objeto 'vehiculo' ahora viene cargado (eager)
        id: string;
        nombre: string;
    }
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

export default function PersonalPage() {
    const [personal, setPersonal] = useState<Personal[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [estadoFilter, setEstadoFilter] = useState("activo"); 
    const { toast } = useToast()

    // --- Cargar Personal desde la API ---
    const fetchPersonal = async () => {
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

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/personal?estado=${estadoFilter}`, { headers });

            // --- CORRECCIÓN CRÍTICA PARA MANEJAR TABLA VACÍA ---
            if (!response.ok) {
                if (response.status === 404 || response.status === 204) {
                    setPersonal([]); // Lista vacía
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error del servidor (${response.status})`);
                }
            } else {
                const data: Personal[] = await response.json();
                setPersonal(data);
            }
        } catch (err: any) {
            setError(err.message);
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchPersonal();
    }, [toast, estadoFilter]); 

    // --- Filtrar por Búsqueda ---
    const filteredPersonal = useMemo(() => {
        return personal.filter(
            (p) =>
                p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.puesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.vehiculo && p.vehiculo.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [personal, searchTerm]);

    // --- Cálculos ---
    const totalPersonal = personal.length;
    const totalSalarios = personal.reduce((sum, p) => sum + (p.salario || 0), 0);

    // --- Lógica de Acciones (Conectada a la API) ---
    const cambiarEstadoPersonal = async (id: string, nuevoEstado: "activo" | "inactivo" | "eliminado") => {
        const empleado = personal.find(p => p.id === id);
        if (!empleado) return;
        
        if (!window.confirm(`¿Estás seguro de mover a "${empleado.nombre}" a ${nuevoEstado}?`)) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Sesión no válida.");

            const method = nuevoEstado === 'eliminado' ? 'DELETE' : 'PATCH';
            
            const requestOptions: RequestInit = {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` }
            };

            if (nuevoEstado !== 'eliminado') {
                requestOptions.headers = { ...requestOptions.headers, 'Content-Type': 'application/json' };
                requestOptions.body = JSON.stringify({ estado: nuevoEstado });
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/personal/${id}`, requestOptions);

            if (!response.ok) {
                // Manejo de error específico para eliminar (ForeignKey)
                if (method === 'DELETE') {
                    const errData = await response.json().catch(() => ({}));
                    if (errData.message && errData.message.includes('foreign key constraint')) {
                        throw new Error("No se puede eliminar: El empleado está asignado a un vehículo o gasto.");
                    } else {
                        throw new Error(errData.message || "No se pudo eliminar el empleado.");
                    }
                }
                throw new Error("No se pudo actualizar el estado del empleado");
            }
            
            fetchPersonal(); // Recargar datos para reflejar el cambio

            let mensaje = "";
            if (nuevoEstado === "eliminado") mensaje = "Empleado eliminado permanentemente";
            if (nuevoEstado === "inactivo") mensaje = "Empleado desactivado correctamente";
            if (nuevoEstado === "activo") mensaje = "Empleado activado correctamente";

            toast({
                title: "Estado actualizado",
                description: `${mensaje}: ${empleado?.nombre}`,
            });

        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    }
    
    // --- MANEJO DE ESTADOS DE CARGA/ERROR ---
    if (loading) {
        return (
            <DashboardLayout title="Gestión de Personal" menuItems={menuItems}>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="ml-3 text-muted-foreground">Cargando personal...</p>
                </div>
            </DashboardLayout>
        );
    }
    
    // Si hay error y no hay datos que mostrar
    if (error && personal.length === 0) {
        return (
            <DashboardLayout title="Gestión de Personal" menuItems={menuItems}>
                <div className="flex flex-col justify-center items-center h-64 text-center p-6 bg-red-50 rounded-lg border border-red-100">
                    <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-red-700 mb-2">Error al cargar datos iniciales</h3>
                    <p className="text-muted-foreground max-w-md">{error}</p>
                    <Button className="mt-4" onClick={fetchPersonal}>
                        Intentar de nuevo
                    </Button>
                </div>
            </DashboardLayout>
        );
    }


    return (
        <DashboardLayout title="Gestión de Personal" menuItems={menuItems}>
            <div className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs">
                                Total Personal ({estadoFilter === 'activo' ? 'Activos' : 'Inactivos'})
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl md:text-2xl font-bold">{totalPersonal}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs">Total Salarios (Mensual)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl md:text-2xl font-bold text-green-600">C${formatCurrency(totalSalarios)}</div>
                        </CardContent>
                    </Card>
                    <Card className="flex items-center justify-center p-4">
                        <Link href="/dashboard/propietario/personal/nuevo" className="w-full">
                            <Button className="w-full h-12 text-base">
                                <Plus className="h-5 w-5 mr-2" />
                                Registrar Personal
                            </Button>
                        </Link>
                    </Card>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                    <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, puesto, vehículo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 w-full"
                            />
                        </div>
                        <Select onValueChange={setEstadoFilter} value={estadoFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="activo">Activos</SelectItem>
                                <SelectItem value="inactivo">Inactivos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* El botón de Añadir está en la tarjeta de resumen para desktop */}
                </div>

                {/* --- MENSAJE DE TABLA VACÍA --- */}
                {personal.length === 0 && !loading && (
                    <Card className="mt-6 border-l-4 border-l-purple-500">
                        <CardHeader>
                            <CardTitle>No hay personal registrado</CardTitle>
                            <CardDescription>
                                Registra a tus empleados para asignarles roles, vehículos y salarios.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/propietario/personal/nuevo">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" /> Registrar Personal
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}


                {/* --- TABLA --- */}
                {personal.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Personal ({estadoFilter === 'activo' ? 'Activos' : 'Inactivos'})</CardTitle>
                            <CardDescription>Lista de todo el personal de la empresa.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Puesto</TableHead>
                                            <TableHead>Contacto</TableHead>
                                            <TableHead>Salario</TableHead>
                                            <TableHead>Vehículo Asignado</TableHead>
                                            <TableHead>Contratación</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPersonal.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center h-24">No se encontró personal que coincida con los filtros.</TableCell>
                                            </TableRow>
                                        )}
                                        {filteredPersonal.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-medium whitespace-nowrap">{p.nombre}</TableCell>
                                                <TableCell>
                                                    <Badge variant={p.puesto === 'Chofer' ? 'default' : 'secondary'}>
                                                        {p.puesto}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">{p.contacto || "N/A"}</TableCell>
                                                <TableCell className="whitespace-nowrap">C${formatCurrency(p.salario)}</TableCell>
                                                <TableCell className="whitespace-nowrap">{p.vehiculo?.nombre || "N/A"}</TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {p.fechaContratacion ? new Date(p.fechaContratacion + "T00:00:00").toLocaleDateString('es-NI') : "N/A"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/dashboard/propietario/personal/${p.id}`}>
                                                            <Button variant="ghost" size="icon" title="Editar">
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        
                                                        {p.estado === "activo" ? (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon"
                                                                title="Desactivar"
                                                                onClick={() => cambiarEstadoPersonal(p.id, "inactivo")}
                                                            >
                                                                <EyeOff className="h-4 w-4" />
                                                            </Button>
                                                        ) : (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon"
                                                                title="Activar"
                                                                onClick={() => cambiarEstadoPersonal(p.id, "activo")}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            title="Eliminar (Mover a Papelera)"
                                                            onClick={() => cambiarEstadoPersonal(p.id, "eliminado")}
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