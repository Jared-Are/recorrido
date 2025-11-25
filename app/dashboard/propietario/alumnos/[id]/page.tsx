"use client"

// 👇 Importamos 'use' de react para desenvolver los params
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, DollarSign, Bus, UserCog, Bell, BarChart3, TrendingDown, ArrowLeft, Save, Loader2, UserCheck, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Separator } from "@/components/ui/separator"

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

type Vehiculo = { id: string; nombre: string };

// 👇 Cambiamos el tipo de params a Promise
export default function EditarFamiliaPage({ params }: { params: Promise<{ id: string }> }) {
    // 👇 Desenvolvemos el ID usando el hook 'use'
    const { id } = use(params);
    
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    
    const [tutorData, setTutorData] = useState({
        nombre: "",
        telefono: "",
        direccion: "" 
    });
    const [tutorId, setTutorId] = useState<string | null>(null);

    const [hijos, setHijos] = useState<any[]>([]);
    const [precioFamiliarTotal, setPrecioFamiliarTotal] = useState(0);

    useEffect(() => {
        const init = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                if (!token) throw new Error("Sesión inválida");

                const headers = { 'Authorization': `Bearer ${token}` };
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

                const resVehiculos = await fetch(`${apiUrl}/vehiculos?estado=activo`, { headers });
                if (resVehiculos.ok) setVehiculos(await resVehiculos.json());

                // 👇 Usamos el 'id' ya desenvelto
                const resAlumno = await fetch(`${apiUrl}/alumnos/${id}`, { headers });
                if (!resAlumno.ok) throw new Error("Alumno no encontrado");
                const alumnoPrincipal = await resAlumno.json();

                const tId = alumnoPrincipal.tutorUserId;
                setTutorId(tId);

                setTutorData({
                    nombre: alumnoPrincipal.tutorUser?.nombre || alumnoPrincipal.tutor || "",
                    telefono: alumnoPrincipal.tutorUser?.telefono || alumnoPrincipal.contacto || "",
                    direccion: alumnoPrincipal.direccion || ""
                });

                let todosLosHijos = [alumnoPrincipal];
                if (tId) {
                    const resTodos = await fetch(`${apiUrl}/alumnos`, { headers });
                    if (resTodos.ok) {
                        const listaCompleta = await resTodos.json();
                        todosLosHijos = listaCompleta.filter((a: any) => a.tutorUserId === tId);
                    }
                }

                const hijosFormateados = todosLosHijos.map((h: any) => ({
                    id: h.id,
                    nombre: h.nombre,
                    grado: h.grado,
                    vehiculoId: h.vehiculo?.id || h.vehiculoId || "",
                    precio: Number(h.precio),
                    activo: h.activo
                }));

                setHijos(hijosFormateados);
                const total = hijosFormateados.reduce((sum: number, h: any) => sum + h.precio, 0);
                setPrecioFamiliarTotal(total);

            } catch (error: any) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
                router.push("/dashboard/propietario/alumnos");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id, toast, router]); // Dependencia actualizada a 'id'

    const handleChangeHijo = (index: number, field: string, value: any) => {
        const nuevos = [...hijos];
        nuevos[index] = { ...nuevos[index], [field]: value };
        setHijos(nuevos);
    };

    const agregarHermano = () => {
        setHijos([...hijos, { nombre: "", grado: "", vehiculoId: "", precio: 0, activo: true }]);
    };

    const eliminarHijo = async (index: number) => {
        const hijo = hijos[index];
        if (hijo.id) {
            if (!confirm(`¿Estás seguro de eliminar a ${hijo.nombre}? Esto borrará su historial.`)) return;
            try {
                const { data: { session } } = await supabase.auth.getSession();
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos/${hijo.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${session?.access_token}` }
                });
                toast({ title: "Alumno eliminado" });
            } catch (e) {
                console.error(e);
                return; 
            }
        }
        const nuevos = [...hijos];
        nuevos.splice(index, 1);
        setHijos(nuevos);
        const total = nuevos.reduce((sum: number, h: any) => sum + Number(h.precio), 0);
        setPrecioFamiliarTotal(total);
    };

    const redistribuirPrecio = (nuevoTotal: number) => {
        setPrecioFamiliarTotal(nuevoTotal);
        const count = hijos.length;
        if (count === 0) return;
        
        const base = Math.floor(nuevoTotal / count);
        const resto = nuevoTotal % count;
        
        const nuevosHijos = hijos.map((h, i) => ({
            ...h,
            precio: base + (i === 0 ? resto : 0)
        }));
        setHijos(nuevosHijos);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

            if (tutorId) {
                await fetch(`${apiUrl}/users/${tutorId}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({
                        nombre: tutorData.nombre,
                        telefono: tutorData.telefono
                    })
                });
            }

            for (const hijo of hijos) {
                const payload = {
                    nombre: hijo.nombre,
                    grado: hijo.grado,
                    vehiculoId: hijo.vehiculoId,
                    precio: hijo.precio,
                    direccion: tutorData.direccion,
                    activo: hijo.activo,
                    tutor: tutorId ? undefined : tutorData.nombre,
                    contacto: tutorId ? undefined : tutorData.telefono,
                    ...( !hijo.id && { tutorUserId: tutorId }) 
                };

                if (hijo.id) {
                    await fetch(`${apiUrl}/alumnos/${hijo.id}`, {
                        method: 'PATCH', headers, body: JSON.stringify(payload)
                    });
                } else {
                    const createPayload = {
                        ...payload,
                        tutor: { nombre: tutorData.nombre, telefono: tutorData.telefono }
                    };
                    await fetch(`${apiUrl}/alumnos`, {
                        method: 'POST', headers, body: JSON.stringify(createPayload)
                    });
                }
            }
            
            toast({ title: "Familia Actualizada", description: "Todos los cambios se han guardado." });
            router.push("/dashboard/propietario/alumnos");

        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen justify-center items-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <DashboardLayout title="Editar Familia" menuItems={menuItems}>
            <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex justify-between items-center">
                    <Link href="/dashboard/propietario/alumnos">
                        <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Button>
                    </Link>
                    {/* SIN COLORES LLAMATIVOS */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-1 rounded-full border">
                        <UserCheck className="w-4 h-4" /> Editando Grupo Familiar
                    </div>
                </div>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Información Familiar</CardTitle>
                        <CardDescription>Modifica los datos del responsable y gestiona a todos los estudiantes del grupo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-8">
                            
                            {/* SIN COLORES DE FONDO FUERTES */}
                            <div className="p-6 rounded-lg border bg-card/50">
                                <h3 className="text-sm font-bold uppercase text-muted-foreground mb-4 tracking-wider">Datos del Tutor (Responsable)</h3>
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Nombre del Tutor</Label>
                                        <Input 
                                            value={tutorData.nombre} 
                                            onChange={(e) => setTutorData({...tutorData, nombre: e.target.value})}
                                            placeholder="Nombre completo"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Teléfono (Contacto)</Label>
                                        <Input 
                                            value={tutorData.telefono} 
                                            onChange={(e) => setTutorData({...tutorData, telefono: e.target.value})}
                                            placeholder="Ej: 5555-5555"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Dirección de Recogida</Label>
                                        <Input 
                                            value={tutorData.direccion} 
                                            onChange={(e) => setTutorData({...tutorData, direccion: e.target.value})}
                                            placeholder="Dirección exacta"
                                        />
                                        <p className="text-xs text-muted-foreground">Esta dirección se aplicará a todos los hijos.</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Estudiantes ({hijos.length})</h3>
                                    <div className="w-48">
                                        <Label className="text-xs mb-1 block text-right font-medium">Mensualidad Familiar (C$)</Label>
                                        {/* INPUT LIMPIO SIN COLORES VERDES */}
                                        <Input 
                                            type="number" 
                                            value={precioFamiliarTotal}
                                            onChange={(e) => redistribuirPrecio(Number(e.target.value))}
                                            className="text-right font-bold text-lg"
                                        />
                                    </div>
                                </div>

                                {hijos.map((hijo, index) => (
                                    <div key={index} className="grid gap-4 md:grid-cols-12 items-end p-4 border rounded-lg shadow-sm relative bg-card">
                                        <div className="md:col-span-4 space-y-2">
                                            <Label>Nombre</Label>
                                            <Input 
                                                value={hijo.nombre} 
                                                onChange={(e) => handleChangeHijo(index, "nombre", e.target.value)} 
                                                placeholder="Nombre del alumno"
                                            />
                                        </div>
                                        <div className="md:col-span-3 space-y-2">
                                            <Label>Grado</Label>
                                            <Select value={hijo.grado} onValueChange={(val) => handleChangeHijo(index, "grado", val)}>
                                                <SelectTrigger><SelectValue placeholder="Grado" /></SelectTrigger>
                                                <SelectContent>
                                                    {["1° Preescolar", "2° Preescolar", "3° Preescolar", "1° Primaria", "2° Primaria", "3° Primaria", "4° Primaria", "5° Primaria", "6° Primaria"].map(g => (
                                                        <SelectItem key={g} value={g}>{g}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="md:col-span-3 space-y-2">
                                            <Label>Vehículo</Label>
                                            <Select value={hijo.vehiculoId || "N/A"} onValueChange={(val) => handleChangeHijo(index, "vehiculoId", val)}>
                                                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                                <SelectContent>
                                                    {vehiculos.map(v => <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="md:col-span-2 flex gap-2 items-end">
                                            <div className="space-y-2 flex-1">
                                                <Label className="text-xs text-muted-foreground">Cuota</Label>
                                                <div className="h-10 flex items-center px-3 bg-muted rounded-md border text-sm text-muted-foreground">
                                                    C$ {hijo.precio}
                                                </div>
                                            </div>
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 mb-0.5"
                                                onClick={() => eliminarHijo(index)}
                                                title="Eliminar estudiante"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <Button type="button" variant="outline" onClick={agregarHermano} className="w-full border-dashed py-6 text-muted-foreground hover:text-primary hover:border-primary">
                                    <Plus className="h-4 w-4 mr-2" /> Agregar otro hermano a este grupo
                                </Button>
                            </div>

                            <div className="flex justify-end pt-6 border-t">
                                {/* BOTÓN STANDARD */}
                                <Button type="submit" disabled={saving} className="min-w-[200px]">
                                    {saving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Guardar Cambios
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}