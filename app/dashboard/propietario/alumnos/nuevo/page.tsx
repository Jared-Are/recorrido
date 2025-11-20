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
import { supabase } from "@/lib/supabase"; // Importamos Supabase

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

// --- TIPO PARA EL VEHÍCULO CARGADO ---
type Vehiculo = {
    id: string;
    nombre: string;
};

export default function NuevoAlumnoPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    // --- NUEVO ESTADO PARA LOS VEHÍCULOS ---
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [vehiculosLoading, setVehiculosLoading] = useState(true); // Nuevo estado de carga

    const [formData, setFormData] = useState({
        nombre: "",
        tutor: "",
        grado: "",
        contacto: "",
        direccion: "",
        vehiculoId: "", 
        precio: "", 
        hermanos: false,
    });

    const [otrosHijos, setOtrosHijos] = useState<
        { nombre: string; grado: string; vehiculoId: string }[] 
    >([]);

    // --- CARGAR VEHÍCULOS AL INICIAR (CORRECCIÓN DE SEGURIDAD Y ERROR) ---
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
                
                // --- MANEJO DE ERROR CRÍTICO (404/204 -> [] vacío) ---
                if (!response.ok) {
                    if (response.status === 404 || response.status === 204) {
                        setVehiculos([]); // No hay vehículos, es un estado válido
                    } else {
                        // Si es otro error (ej. 500), lanzamos para que se loguee en consola
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.message || `Error del servidor (${response.status})`);
                    }
                } else {
                    const data: Vehiculo[] = await response.json();
                    setVehiculos(data);
                }

            } catch (err: any) {
                // SOLO mostramos el error en la consola, no al usuario, ya que no bloquea el formulario
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

    const handleChangeHijo = (
        index: number,
        field: "nombre" | "grado" | "vehiculoId", 
        value: string
    ) => {
        const nuevos = [...otrosHijos];
        nuevos[index][field] = value;
        setOtrosHijos(nuevos);
    };

    // --- GUARDAR EN LA API ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const alumnosAInscribir = [
            { nombre: formData.nombre, grado: formData.grado, vehiculoId: formData.vehiculoId },
            ...otrosHijos.filter((h) => h.nombre.trim() !== ""),
        ];
        const numeroDeHijos = alumnosAInscribir.length;

        const precioFamiliar = Number(formData.precio);
        if (precioFamiliar <= 0) {
            toast({ title: "Error", description: "El precio familiar debe ser mayor a cero.", variant: "destructive" });
            setLoading(false);
            return;
        }

        if (precioFamiliar % numeroDeHijos !== 0) {
            toast({ 
                title: "Error de Precio", 
                description: `El precio familiar (C$ ${precioFamiliar}) no es divisible entre el número de hijos (${numeroDeHijos}). Ajuste el precio a un monto que resulte en un número entero por alumno.`, 
                variant: "destructive",
                duration: 8000 
            });
            setLoading(false);
            return;
        }
        const precioIndividual = precioFamiliar / numeroDeHijos;
        
        // Validar que se seleccionó vehículo para todos (y que el ID no sea el placeholder)
        const vehiculoInvalido = alumnosAInscribir.some(a => !a.vehiculoId || a.vehiculoId.length < 5 || a.vehiculoId === "placeholder-value");
        if (vehiculoInvalido) {
             toast({ title: "Error", description: "Por favor, asigna un vehículo a cada alumno.", variant: "destructive" });
             setLoading(false);
             return;
        }


        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Sesión no válida.");

            const headers = { 
                'Authorization': `Bearer ${token}`, // Enviamos el token de seguridad
                'Content-Type': 'application/json'
            };


            const promesasDeCreacion = alumnosAInscribir.map((alumno) => {
                
                const payload = {
                    nombre: alumno.nombre,
                    grado: alumno.grado,
                    tutor: formData.tutor,
                    contacto: formData.contacto,
                    direccion: formData.direccion,
                    vehiculoId: alumno.vehiculoId,
                    precio: precioIndividual, 
                    activo: true, 
                };

                return fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(payload),
                });
            });

            const responses = await Promise.all(promesasDeCreacion);

            const respuestasFallidas = responses.filter((res) => !res.ok);
            if (respuestasFallidas.length > 0) {
                const errorText = await respuestasFallidas[0].text();
                // Intentamos parsear el mensaje de error del backend
                let errorMessage = `Error al registrar a uno o más alumnos.`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorJson.error || errorMessage;
                } catch {}

                throw new Error(errorMessage);
            }

            toast({
                title: "Registro Exitoso",
                description: `Se registraron ${alumnosAInscribir.length} alumno(s) (${precioIndividual.toFixed(2)} C$ c/u).`,
            });
            
            router.push("/dashboard/propietario/alumnos");

        } catch (err: any) {
            console.error("Error en handleSubmit:", err);
            toast({
                title: "Error en el registro",
                description: err.message.substring(0, 100) || "No se pudieron guardar los datos.",
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
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a la lista
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Nuevo Alumno</CardTitle>
                        <CardDescription>Completa los datos del estudiante y su familia.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            
                            {/* --- SECCIÓN DE DATOS PRINCIPALES --- */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre Completo * (Hijo 1)</Label>
                                    <Input id="nombre" placeholder="Ej: Juan Pérez López" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tutor">Nombre del Tutor *</Label>
                                    <Input id="tutor" placeholder="Ej: María Pérez" value={formData.tutor} onChange={(e) => setFormData({ ...formData, tutor: e.target.value })} required />
                                </div>
                                
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="direccion">Dirección *</Label>
                                    <Input id="direccion" placeholder="Ej: Calle Ficticia 123, Zona A" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="grado">Grado * (Hijo 1)</Label>
                                    <Select value={formData.grado} onValueChange={(value) => setFormData({ ...formData, grado: value })}>
                                        <SelectTrigger><SelectValue placeholder="Selecciona el grado" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1° Preescolar">1° Preescolar</SelectItem>
                                            <SelectItem value="2° Preescolar">2° Preescolar</SelectItem>
                                            <SelectItem value="3° Preescolar">3° Preescolar</SelectItem>
                                            <SelectItem value="1° Primaria">1° Primaria</SelectItem>
                                            <SelectItem value="2° Primaria">2° Primaria</SelectItem>
                                            <SelectItem value="3° Primaria">3° Primaria</SelectItem>
                                            <SelectItem value="4° Primaria">4° Primaria</SelectItem>
                                            <SelectItem value="5° Primaria">5° Primaria</SelectItem>
                                            <SelectItem value="6° Primaria">6° Primaria</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contacto">Teléfono de Contacto *</Label>
                                    <Input id="contacto" type="tel" placeholder="Ej: 555-0123" value={formData.contacto} onChange={(e) => setFormData({ ...formData, contacto: e.target.value })} required />
                                </div>
                            </div>

                            {/* --- SELECTOR DE RECORRIDO/VEHÍCULO (HIJO 1) --- */}
                            <div className="space-y-2">
                                <Label>Asignar Vehículo * (Hijo 1)</Label>
                                <Select
                                    value={formData.vehiculoId}
                                    onValueChange={(value) => setFormData({ ...formData, vehiculoId: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={vehiculosLoading ? "Cargando vehículos..." : "Selecciona un vehículo"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* CORRECCIÓN 1: Usar un valor no vacío para el placeholder */}
                                        <SelectItem value="placeholder-value" disabled>
                                            {vehiculos.length === 0 ? "No hay vehículos activos" : "Selecciona un vehículo"}
                                        </SelectItem>
                                        {vehiculos.map(v => (
                                            <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="precio">Precio Mensual (Total por Familia) *</Label>
                                <Input id="precio" type="number" placeholder="Ej: 1500" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} required />
                                <p className="text-xs text-muted-foreground">
                                    Este precio se dividirá automáticamente entre todos los hijos registrados.
                                </p>
                            </div>

                            {/* --- CHECKBOX HERMANOS --- */}
                            <div className="flex items-center gap-2 pt-2">
                                <Checkbox
                                    checked={formData.hermanos}
                                    onCheckedChange={(checked) => {
                                        setFormData({ ...formData, hermanos: checked === true });
                                        // Aseguramos que el primer hermano también tenga un placeholder de vehículo
                                        if (checked) setOtrosHijos([{ nombre: "", grado: "", vehiculoId: "" }]); 
                                        else setOtrosHijos([]);
                                    }}
                                    id="hermanos-check"
                                />
                                <Label htmlFor="hermanos-check">¿Tiene más hijos en el recorrido?</Label>
                            </div>

                            {/* --- SECCIÓN DE HERMANOS --- */}
                            {formData.hermanos && (
                                <div className="space-y-4 mt-4 border-t pt-4">
                                    <Label>Otros hijos</Label>
                                    {otrosHijos.map((hijo, index) => (
                                        <div key={index} className="grid gap-2 md:grid-cols-4 items-end">
                                            <div className="space-y-2">
                                                <Label>Nombre del hijo {index + 2}</Label>
                                                <Input placeholder={`Ej: Pedro Pérez`} value={hijo.nombre} onChange={(e) => handleChangeHijo(index, "nombre", e.target.value)} />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label>Grado (Hijo {index + 2})</Label>
                                                <Select value={hijo.grado} onValueChange={(value) => handleChangeHijo(index, "grado", value)}>
                                                    <SelectTrigger><SelectValue placeholder="Selecciona el grado" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1° Preescolar">1° Preescolar</SelectItem>
                                                        <SelectItem value="2° Preescolar">2° Preescolar</SelectItem>
                                                        <SelectItem value="3° Preescolar">3° Preescolar</SelectItem>
                                                        <SelectItem value="1° Primaria">1° Primaria</SelectItem>
                                                        <SelectItem value="2° Primaria">2° Primaria</SelectItem>
                                                        <SelectItem value="3° Primaria">3° Primaria</SelectItem>
                                                        <SelectItem value="4° Primaria">4° Primaria</SelectItem>
                                                        <SelectItem value="5° Primaria">5° Primaria</SelectItem>
                                                        <SelectItem value="6° Primaria">6° Primaria</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            
                                            {/* --- SELECTOR DE VEHÍCULO (HERMANOS) --- */}
                                            <div className="space-y-2">
                                                <Label>Vehículo (Hijo {index + 2})</Label>
                                                <Select 
                                                    value={hijo.vehiculoId}
                                                    onValueChange={(value) => handleChangeHijo(index, "vehiculoId", value)}
                                                >
                                                    <SelectTrigger>
                                                         <SelectValue placeholder={vehiculosLoading ? "Cargando..." : "Selecciona un vehículo"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                         {/* CORRECCIÓN 2: Usar un valor no vacío para el placeholder */}
                                                        <SelectItem value="placeholder-value" disabled>
                                                            {vehiculos.length === 0 ? "No hay vehículos activos" : "Selecciona un vehículo"}
                                                        </SelectItem>
                                                        {vehiculos.map(v => (
                                                            <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <Button type="button" variant="destructive" size="icon" onClick={() => eliminarHijo(index)} className="mt-6">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" onClick={agregarHijo} className="mt-2">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar otro hijo
                                    </Button>
                                </div>
                            )}

                            {/* --- BOTONES DE GUARDADO --- */}
                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={loading}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {loading ? "Guardando..." : "Guardar Alumno(s)"}
                                </Button>
                                <Link href="/dashboard/propietario/alumnos">
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