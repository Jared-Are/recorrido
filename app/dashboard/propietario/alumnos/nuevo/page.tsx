"use client";

import type React from "react";
import { Checkbox } from "@/components/ui/checkbox";
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
    Trash2, 
    Plus,
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

// --- DEFINICIÓN DEL MENÚ ---
const menuItems: MenuItem[] = [
    { title: "Gestionar Alumnos", description: "Ver y administrar estudiantes", icon: Users, href: "/dashboard/propietario/alumnos", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20", },
    { title: "Gestionar Pagos", description: "Ver historial y registrar pagos", icon: DollarSign, href: "/dashboard/propietario/pagos", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20", },
    { title: "Gestionar Gastos", description: "Control de combustible, salarios, etc.", icon: TrendingDown, href: "/dashboard/propietario/gastos", color: "text-pink-600", bgColor: "bg-pink-50 dark:bg-pink-900/20", },
    { title: "Gestionar Personal", description: "Administrar empleados y choferes", icon: Users, href: "/dashboard/propietario/personal", color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-900/20", },
    { title: "Gestionar Vehículos", description: "Administrar flota de vehículos", icon: Bus, href: "/dashboard/propietario/vehiculos", color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900/20", },
    { title: "Gestionar Usuarios", description: "Administrar accesos al sistema", icon: UserCog, href: "/dashboard/propietario/usuarios", color: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-900/20", },
    { title: "Enviar Avisos", description: "Comunicados a tutores y personal", icon: Bell, href: "/dashboard/propietario/avisos", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-900/20", },
    { title: "Generar Reportes", description: "Estadísticas y análisis", icon: BarChart3, href: "/dashboard/propietario/reportes", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20", },
];

type Vehiculo = {
    id: string;
    nombre: string;
};

export default function NuevoAlumnoPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [vehiculosLoading, setVehiculosLoading] = useState(true);

    const [formData, setFormData] = useState({
        nombre: "",
        tutorNombre: "",
        tutorTelefono: "", 
        grado: "",
        direccion: "", 
        vehiculoId: "", 
        precio: "", 
        hermanos: false,
    });

    const [otrosHijos, setOtrosHijos] = useState<
        { nombre: string; grado: string; vehiculoId: string }[] 
    >([]);

    useEffect(() => {
        const fetchVehiculos = async () => {
            setVehiculosLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                if (!token) throw new Error("Sesión no válida.");
    
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };
                
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos?estado=activo`, { headers });
                
                if (response.ok) {
                    const data: Vehiculo[] = await response.json();
                    setVehiculos(data);
                }
            } catch (err: any) {
                console.error("Error al cargar vehículos:", err);
            } finally {
                setVehiculosLoading(false);
            }
        };
        fetchVehiculos();
    }, [toast]);

    const agregarHijo = () => {
        setOtrosHijos([...otrosHijos, { nombre: "", grado: "", vehiculoId: "" }]); 
    };

    const eliminarHijo = (index: number) => {
        const nuevos = [...otrosHijos];
        nuevos.splice(index, 1);
        setOtrosHijos(nuevos);
    };

    const handleChangeHijo = (index: number, field: "nombre" | "grado" | "vehiculoId", value: string) => {
        const nuevos = [...otrosHijos];
        nuevos[index][field] = value;
        setOtrosHijos(nuevos);
    };

    // --- CÁLCULO INTERNO DE PRECIOS (El usuario no ve esto, solo ve el total) ---
    const calcularPreciosIndividuales = (totalFamiliar: number, totalHijos: number) => {
        const base = Math.floor(totalFamiliar / totalHijos);
        const resto = totalFamiliar % totalHijos;
        const precios = Array(totalHijos).fill(base);
        precios[0] += resto; // Ajustamos los centavos en el primer hijo
        return precios;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const precioFamiliar = Number(formData.precio);
        if (precioFamiliar <= 0) {
            toast({ title: "Error", description: "El precio familiar debe ser mayor a cero.", variant: "destructive" });
            setLoading(false);
            return;
        }

        // Lista completa de alumnos a registrar
        const listaHijos = [
            { nombre: formData.nombre, grado: formData.grado, vehiculoId: formData.vehiculoId },
            ...otrosHijos.filter((h) => h.nombre.trim() !== ""),
        ];
        
        // Distribuimos el precio internamente
        const preciosDistribuidos = calcularPreciosIndividuales(precioFamiliar, listaHijos.length);

        if (!formData.tutorNombre.trim() || !formData.tutorTelefono.trim() || !formData.direccion.trim()) {
            toast({ title: "Faltan datos", description: "Nombre, teléfono y dirección son obligatorios.", variant: "destructive" });
            setLoading(false);
            return;
        }

        if (listaHijos.some(a => !a.vehiculoId || a.vehiculoId === "placeholder-value")) {
             toast({ title: "Falta Vehículo", description: "Asigna un vehículo a cada alumno.", variant: "destructive" });
             setLoading(false);
             return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Sesión no válida.");

            const headers = { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // 🚀 SOLUCIÓN A LA "CONDICIÓN DE CARRERA"
            // Usamos un bucle for...of para enviar uno por uno.
            for (const [index, alumno] of listaHijos.entries()) {
                
                const payload = {
                    nombre: alumno.nombre.trim(),
                    grado: alumno.grado,
                    tutor: { 
                        nombre: formData.tutorNombre.trim(),
                        telefono: formData.tutorTelefono.trim()
                    },
                    direccion: formData.direccion.trim(),
                    vehiculoId: alumno.vehiculoId,
                    precio: preciosDistribuidos[index], // Precio fraccionado
                    activo: true, 
                };

                console.log(`Registrando ${index + 1}/${listaHijos.length}: ${payload.nombre}`);

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error al registrar a ${alumno.nombre}`);
                }
            }

            toast({
                title: "Familia Registrada",
                description: `Se registraron ${listaHijos.length} alumnos correctamente.`,
            });
            
            router.push("/dashboard/propietario/alumnos");

        } catch (err: any) {
            console.error("Error en handleSubmit:", err);
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Registrar Alumno" menuItems={menuItems}>
            <div className="space-y-6">
                <div className="flex justify-between">
                    <Link href="/dashboard/propietario/alumnos">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Nuevo Ingreso</CardTitle>
                        <CardDescription>Registra al estudiante y su grupo familiar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre del Alumno * (Hijo 1)</Label>
                                    <Input 
                                        id="nombre" 
                                        placeholder="Ej: Juan Pérez" 
                                        value={formData.nombre} 
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="grado">Grado *</Label>
                                    <Select value={formData.grado} onValueChange={(value) => setFormData({ ...formData, grado: value })}>
                                        <SelectTrigger><SelectValue placeholder="Selecciona grado" /></SelectTrigger>
                                        <SelectContent>
                                            {["1° Preescolar", "2° Preescolar", "3° Preescolar", "1° Primaria", "2° Primaria", "3° Primaria", "4° Primaria", "5° Primaria", "6° Primaria"].map(g => (
                                                <SelectItem key={g} value={g}>{g}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tutorNombre">Nombre del Tutor *</Label>
                                    <Input id="tutorNombre" placeholder="Ej: María Pérez" value={formData.tutorNombre} onChange={(e) => setFormData({ ...formData, tutorNombre: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tutorTelefono">Teléfono del Tutor *</Label>
                                    <Input id="tutorTelefono" type="tel" placeholder="Ej: 555-0123" value={formData.tutorTelefono} onChange={(e) => setFormData({ ...formData, tutorTelefono: e.target.value })} required />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="direccion">Dirección Completa *</Label>
                                    <Input id="direccion" placeholder="Ej: Del palo de mango 2c al sur..." value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Vehículo Asignado *</Label>
                                    <Select value={formData.vehiculoId} onValueChange={(value) => setFormData({ ...formData, vehiculoId: value })} required>
                                        <SelectTrigger><SelectValue placeholder="Selecciona vehículo" /></SelectTrigger>
                                        <SelectContent>
                                            {vehiculos.map(v => <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="precio" className="text-green-600 font-bold">Precio Mensual FAMILIAR (C$) *</Label>
                                    <Input 
                                        id="precio" 
                                        type="number" 
                                        placeholder="Ej: 1500" 
                                        value={formData.precio} 
                                        onChange={(e) => setFormData({ ...formData, precio: e.target.value })} 
                                        required 
                                        className="border-green-200 focus:ring-green-500"
                                    />
                                    <p className="text-xs text-muted-foreground">Monto total que paga la familia por todos los hijos.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t">
                                <Checkbox
                                    checked={formData.hermanos}
                                    onCheckedChange={(checked) => {
                                        setFormData({ ...formData, hermanos: checked === true });
                                        if (checked) setOtrosHijos([{ nombre: "", grado: "", vehiculoId: "" }]); 
                                        else setOtrosHijos([]);
                                    }}
                                    id="hermanos-check"
                                />
                                <Label htmlFor="hermanos-check" className="font-medium cursor-pointer">¿Tiene hermanos que viajan también?</Label>
                            </div>

                            {formData.hermanos && (
                                <div className="space-y-4 mt-4 border-t pt-4">
                                    {otrosHijos.map((hijo, index) => (
                                        <div key={index} className="grid gap-4 md:grid-cols-3 items-end border-b pb-4 last:border-0">
                                            <div className="space-y-2">
                                                <Label>Nombre Hermano {index + 1}</Label>
                                                <Input value={hijo.nombre} onChange={(e) => handleChangeHijo(index, "nombre", e.target.value)} placeholder="Nombre completo" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Grado</Label>
                                                <Select value={hijo.grado} onValueChange={(value) => handleChangeHijo(index, "grado", value)}>
                                                    <SelectTrigger><SelectValue placeholder="Grado" /></SelectTrigger>
                                                    <SelectContent>
                                                        {["1° Preescolar", "2° Preescolar", "3° Preescolar", "1° Primaria", "2° Primaria", "3° Primaria", "4° Primaria", "5° Primaria", "6° Primaria"].map(g => (
                                                            <SelectItem key={g} value={g}>{g}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2 flex gap-2">
                                                <div className="flex-1">
                                                    <Label>Vehículo</Label>
                                                    <Select value={hijo.vehiculoId} onValueChange={(value) => handleChangeHijo(index, "vehiculoId", value)}>
                                                        <SelectTrigger><SelectValue placeholder="Vehículo" /></SelectTrigger>
                                                        <SelectContent>
                                                            {vehiculos.map(v => <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => eliminarHijo(index)} className="text-red-500 mt-6">
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" onClick={agregarHijo} size="sm">
                                        <Plus className="h-4 w-4 mr-2" /> Agregar otro hermano
                                    </Button>
                                </div>
                            )}

                            <div className="flex gap-3 pt-6">
                                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                    Registrar Familia
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}