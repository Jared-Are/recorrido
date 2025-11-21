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
import { Textarea } from "@/components/ui/textarea"; 
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
import { supabase } from "@/lib/supabase";

// --- TIPOS ---
type Vehiculo = {
    id: string;
    nombre: string;
};

type Personal = {
    id: string;
    nombre: string;
    salario: number;
};

// --- Menú ---
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

export default function NuevoGastoPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [personal, setPersonal] = useState<Personal[]>([]); 
    const [dataLoading, setDataLoading] = useState(true);

    const [formData, setFormData] = useState({
        descripcion: "",
        categoria: "",
        vehiculoId: "N/A", 
        personalId: "N/A", 
        monto: "",
        fecha: new Date().toISOString().split('T')[0], 
    });

    // --- CARGAR VEHÍCULOS Y PERSONAL ---
    useEffect(() => {
        const fetchData = async () => {
            setDataLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                if (!token) throw new Error("Sesión no válida o expirada.");

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                const [vehiculosRes, personalRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos?estado=activo`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/personal?estado=activo`, { headers })
                ]);
                
                const handleRes = async (res: Response) => {
                    if (res.ok) return await res.json();
                    if (res.status === 404 || res.status === 204) return [];
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error del servidor (${res.status})`);
                };

                const dataVehiculos: Vehiculo[] = await handleRes(vehiculosRes);
                setVehiculos(dataVehiculos);
                
                const dataPersonal: Personal[] = await handleRes(personalRes);
                setPersonal(dataPersonal);

            } catch (err: any) {
                console.error("Error al cargar dependencias:", err.message);
                toast({ 
                    title: "Aviso", 
                    description: "No se cargaron vehículos/personal. Registra uno primero.", 
                    variant: "default" 
                }); 
            } finally {
                setDataLoading(false);
            }
        };
        fetchData();
    }, [toast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        if (name === "categoria" && value === "salarios") {
            setFormData(prev => ({ 
                ...prev, 
                categoria: value, 
                descripcion: "Pago de salario: ",
                vehiculoId: "N/A",
                monto: "", 
                personalId: "N/A", 
            }));
        } else if (name === "personalId" && formData.categoria === "salarios") {
            const empleado = personal.find(p => p.id === value);
            if (empleado) {
                setFormData(prev => ({
                    ...prev,
                    personalId: value,
                    monto: (empleado.salario || 0).toString(),
                    descripcion: `Pago de salario: ${empleado.nombre}`
                }));
            } else {
                setFormData(prev => ({ 
                    ...prev,
                    personalId: value,
                    monto: "",
                    descripcion: "Pago de salario: "
                }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- CORREGIDO: Enviar Gasto a la API ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const esSalario = formData.categoria === 'salarios';
        const empleadoSeleccionado = personal.find(p => p.id === formData.personalId);
        const esSalarioManual = esSalario && formData.personalId === "N/A";

        // --- PAYLOAD CORREGIDO: Sin campo 'estado' ---
        const payload = {
            descripcion: formData.descripcion.trim(),
            categoria: formData.categoria,
            monto: parseFloat(formData.monto),
            fecha: formData.fecha,
            // Convertir "N/A" a null
            vehiculoId: formData.vehiculoId === "N/A" ? null : formData.vehiculoId, 
            personalId: formData.personalId === "N/A" ? null : formData.personalId,
            // REMOVIMOS: estado: 'activo' - El backend lo asigna automáticamente
        };

        console.log("📤 Enviando payload:", payload); // Para debugging

        // --- VALIDACIONES MEJORADAS ---
        if (!payload.categoria) {
            toast({ title: "Error de validación", description: "Por favor, selecciona una categoría.", variant: "destructive" });
            setLoading(false);
            return;
        }
        
        if (esSalario && !payload.personalId && !esSalarioManual) {
             toast({ title: "Error de validación", description: "Debes seleccionar un empleado para el pago de salario automático.", variant: "destructive" });
             setLoading(false);
             return;
        }
        
        if (!payload.monto || payload.monto <= 0) {
            toast({ title: "Error de validación", description: "El monto es obligatorio y debe ser mayor a cero.", variant: "destructive" });
            setLoading(false);
            return;
        }

        if (!payload.descripcion.trim()) {
            toast({ title: "Error de validación", description: "La descripción es obligatoria.", variant: "destructive" });
            setLoading(false);
            return;
        }
        // --- FIN VALIDACIONES ---

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Sesión no válida.");

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gastos`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Error del servidor:", response.status, errorText);
                
                let errorMessage = `Error ${response.status}: No se pudo registrar el gasto`;
                try {
                    const errData = JSON.parse(errorText);
                    errorMessage = errData.message || errorMessage;
                    
                    // Si hay errores de validación específicos
                    if (errData.details && Array.isArray(errData.details)) {
                        errorMessage += `: ${errData.details.join(', ')}`;
                    }
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log("✅ Gasto registrado:", result);

            toast({ 
                title: "✅ Gasto Registrado", 
                description: "El gasto se ha guardado correctamente." 
            });
            
            // Redirigir después de un breve delay
            setTimeout(() => {
                router.push("/dashboard/propietario/gastos");
            }, 1000);

        } catch (err: any) {
            console.error("💥 Error completo al guardar:", err);
            toast({ 
                title: "❌ Error al guardar", 
                description: err.message, 
                variant: "destructive" 
            });
        } finally {
            setLoading(false);
        }
    };

    const esSalario = formData.categoria === 'salarios';
    const empleadoSeleccionado = personal.find(p => p.id === formData.personalId);
    const esSalarioManual = esSalario && formData.personalId === "N/A";
    
    if (dataLoading) {
         return (
            <DashboardLayout title="Registrar Gasto" menuItems={menuItems}>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="ml-3 text-muted-foreground">Cargando dependencias...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Registrar Gasto" menuItems={menuItems}>
            <div className="space-y-6">
                <Link href="/dashboard/propietario/gastos">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver a la lista
                    </Button>
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>Registrar Nuevo Gasto</CardTitle>
                        <CardDescription>Completa los detalles del gasto operativo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            
                            <div className="space-y-2">
                                <Label htmlFor="descripcion">Descripción *</Label>
                                <Textarea 
                                    id="descripcion" 
                                    name="descripcion"
                                    placeholder="Ej: Llenado de tanque o Pago de salario..." 
                                    value={formData.descripcion} 
                                    onChange={handleChange} 
                                    required 
                                    disabled={esSalario && empleadoSeleccionado && !esSalarioManual}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="categoria">Categoría *</Label>
                                    <Select 
                                        value={formData.categoria} 
                                        onValueChange={(value) => handleSelectChange("categoria", value)}
                                        required
                                        disabled={loading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="combustible">Combustible</SelectItem>
                                            <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                                            <SelectItem value="salarios">Salarios</SelectItem>
                                            <SelectItem value="otros">Otros</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="vehiculoId">Asignar Vehículo</Label>
                                    <Select 
                                        value={formData.vehiculoId} 
                                        onValueChange={(value) => handleSelectChange("vehiculoId", value)} 
                                        disabled={esSalario || loading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Asignar a un vehículo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="N/A">N/A (Gasto General)</SelectItem>
                                            {vehiculos.length === 0 ? (
                                                <SelectItem value="loading" disabled>No hay vehículos activos</SelectItem>
                                            ) : (
                                                vehiculos.map(v => (
                                                    <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                     {esSalario && (
                                        <p className="text-xs text-muted-foreground">Los salarios no se asignan a vehículos.</p>
                                     )}
                                </div>
                            </div>

                            {esSalario && (
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="personalId">Asignar Empleado *</Label>
                                    <Select 
                                        value={formData.personalId} 
                                        onValueChange={(value) => handleSelectChange("personalId", value)}
                                        disabled={loading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un empleado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="N/A">N/A (Registrar salario manual)</SelectItem>
                                            {personal.length === 0 ? (
                                                 <SelectItem value="loading" disabled>No hay personal activo</SelectItem>
                                            ) : (
                                                personal.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.nombre} (Salario: C${formatCurrency(p.salario || 0)})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="monto">Monto (C$) *</Label>
                                    <Input 
                                        id="monto" 
                                        name="monto" 
                                        type="number" 
                                        step="0.01"
                                        placeholder={esSalario && empleadoSeleccionado && !esSalarioManual ? "Automático" : "Ej: 1500.00"}
                                        value={formData.monto} 
                                        onChange={handleChange} 
                                        required 
                                        disabled={(esSalario && empleadoSeleccionado && !esSalarioManual) || loading}
                                    />
                                     {esSalario && empleadoSeleccionado && !esSalarioManual && (
                                        <p className="text-xs text-muted-foreground">El monto se toma automáticamente del salario del empleado.</p>
                                     )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fecha">Fecha del Gasto *</Label>
                                    <Input 
                                        id="fecha" 
                                        name="fecha" 
                                        type="date" 
                                        value={formData.fecha} 
                                        onChange={handleChange} 
                                        required 
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Guardar Gasto
                                        </>
                                    )}
                                </Button>
                                <Link href="/dashboard/propietario/gastos">
                                    <Button type="button" variant="outline" disabled={loading}>
                                        Cancelar
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}