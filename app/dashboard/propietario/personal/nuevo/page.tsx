"use client";

import { useState, useEffect } from "react"; 
import { useRouter } from "next/navigation";
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    ArrowLeft, 
    Save, 
    Users, 
    DollarSign, 
    Bus, 
    UserCog, 
    Bell, 
    BarChart3, 
    TrendingDown,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase"; // <--- Importamos Supabase

// --- TIPO PARA EL VEHÍCULO CARGADO ---
type Vehiculo = {
    id: string;
    nombre: string;
};
// --- TIPO PERSONAL (Para referencia) ---
type Personal = {
    id: string;
    nombre: string;
    salario: number;
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
];

// Helper de formato de moneda
const formatCurrency = (num: number) => {
    return (num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function NuevoPersonalPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [vehiculosLoading, setVehiculosLoading] = useState(true); // Estado para la carga de dependencias

    const [formData, setFormData] = useState({
        nombre: "",
        puesto: "",
        contacto: "",
        salario: "",
        fechaContratacion: new Date().toISOString().split('T')[0], 
        vehiculoId: "N/A", 
    });

    // --- CARGAR VEHÍCULOS AL INICIAR (CON SEGURIDAD Y MANEJO DE ERROR) ---
    useEffect(() => {
        const fetchVehiculos = async () => {
            setVehiculosLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                if (!token) throw new Error("Sesión no válida o expirada.");

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos?estado=activo`, { headers });
                
                if (!response.ok) {
                    if (response.status === 404 || response.status === 204) {
                        setVehiculos([]); // No hay vehículos, no es error fatal
                    } else {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || `Error del servidor (${response.status})`);
                    }
                } else {
                    const data: Vehiculo[] = await response.json();
                    setVehiculos(data);
                }
            } catch (err: any) {
                // Solo logueamos el error en consola si no afecta la UI principal
                console.error("Error al cargar vehículos:", err);
            } finally {
                setVehiculosLoading(false);
            }
        };
        fetchVehiculos();
    }, [toast]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- Enviar Personal a la API ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            salario: parseFloat(formData.salario) || undefined, 
            vehiculoId: formData.vehiculoId === "N/A" ? null : formData.vehiculoId, 
            estado: 'activo' // Siempre se crea como activo
        };
        
        // --- VALIDACIONES ---
        if (!payload.puesto) {
            toast({ title: "Error de validación", description: "Por favor, selecciona un puesto.", variant: "destructive" });
            setLoading(false);
            return;
        }
        
        if (payload.vehiculoId && !vehiculos.some(v => v.id === payload.vehiculoId)) {
             toast({ title: "Error de validación", description: "El vehículo seleccionado no es válido.", variant: "destructive" });
             setLoading(false);
             return;
        }
        // --- FIN VALIDACIONES ---


        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Sesión no válida.");

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/personal`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Enviar token de seguridad
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "No se pudo registrar al empleado");
            }

            toast({ title: "¡Empleado Registrado!", description: "El empleado se ha guardado correctamente." });
            router.push("/dashboard/propietario/personal");

        } catch (err: any) {
            toast({ title: "Error al guardar", description: (err as Error).message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Registrar Personal" menuItems={menuItems}>
            <div className="space-y-6">
                <Link href="/dashboard/propietario/personal">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a la lista
                    </Button>
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>Registrar Nuevo Empleado</CardTitle>
                        <CardDescription>Completa los detalles del miembro del personal.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre Completo *</Label>
                                    <Input 
                                        id="nombre" 
                                        name="nombre"
                                        placeholder="Ej: Ana García" 
                                        value={formData.nombre} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                                   <div className="space-y-2">
                                    <Label htmlFor="puesto">Puesto *</Label>
                                    <Select 
                                        name="puesto" 
                                        value={formData.puesto} 
                                        onValueChange={(value) => handleSelectChange("puesto", value)}
                                        required
                                    >
                                        <SelectTrigger><SelectValue placeholder="Selecciona un puesto" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Chofer">Chofer</SelectItem>
                                            <SelectItem value="Asistente">Asistente</SelectItem>
                                            <SelectItem value="Administrativo">Administrativo</SelectItem>
                                            <SelectItem value="Otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="contacto">Contacto (Teléfono)</Label>
                                    <Input 
                                        id="contacto" 
                                        name="contacto"
                                        type="tel"
                                        placeholder="Ej: 8888-8888" 
                                        value={formData.contacto} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="salario">Salario (C$)</Label>
                                    <Input 
                                        id="salario" 
                                        name="salario" 
                                        type="number" 
                                        step="0.01"
                                        placeholder="Ej: 8000.00" 
                                        value={formData.salario} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </div>

                               <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fechaContratacion">Fecha de Contratación</Label>
                                    <Input 
                                        id="fechaContratacion" 
                                        name="fechaContratacion" 
                                        type="date" 
                                        value={formData.fechaContratacion} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                {/* --- SELECTOR DE VEHÍCULO (DINÁMICO) --- */}
                                <div className="space-y-2">
                                    <Label htmlFor="vehiculoId">Asignar Vehículo</Label>
                                    <Select 
                                        name="vehiculoId" 
                                        value={formData.vehiculoId} 
                                        onValueChange={(value) => handleSelectChange("vehiculoId", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={vehiculosLoading ? "Cargando vehículos..." : "Asignar a un vehículo"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="N/A">N/A (Sin vehículo fijo)</SelectItem>
                                            {vehiculos.length === 0 ? (
                                                <SelectItem value="loading" disabled>No hay vehículos activos</SelectItem>
                                            ) : (
                                                vehiculos.map(v => (
                                                    <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">Solo se muestran vehículos en estado 'Activo'.</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={loading}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {loading ? "Guardando..." : "Guardar Empleado"}
                                </Button>
                                <Link href="/dashboard/propietario/personal">
                                    <Button type="button" variant="outline">Cancelar</Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}