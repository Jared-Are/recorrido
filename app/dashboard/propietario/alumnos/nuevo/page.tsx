"use client";

import { useState, useEffect } from "react"; 
import { useRouter } from "next/navigation";
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Trash2, Plus, Users, DollarSign, Bus, UserCog, Bell, BarChart3, TrendingDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { z } from "zod"; 

// --- 1. DEFINICIÓN DE REGLAS DE NEGOCIO (ZOD) ---
const nombreRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
const direccionRegex = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s]+$/;

// NUEVA REGLA: 8 dígitos, y el primero debe ser 5, 7 u 8.
const telefonoNicaRegex = /^[578][0-9]{7}$/; 

const alumnoSchema = z.object({
    nombre: z.string()
        .min(3, "El nombre del alumno es muy corto (mínimo 3 letras).")
        .max(60, "El nombre no puede tener más de 60 caracteres.")
        .regex(nombreRegex, "El nombre solo debe contener letras y espacios.")
        .refine((val) => !/(.)\1\1/.test(val), "No puedes repetir la misma letra más de 2 veces seguidas.")
        .refine((val) => /^[A-ZÁÉÍÓÚÑ]/.test(val), "El nombre debe comenzar con mayúscula."),
    grado: z.string().min(1, "Debes seleccionar un grado."),
    vehiculoId: z.string().min(1, "Debes asignar un vehículo."),
});

const formularioSchema = z.object({
    ...alumnoSchema.shape,
    tutorNombre: z.string()
        .min(5, "El nombre del tutor debe ser completo (mínimo 5 letras).")
        .max(60, "El nombre del tutor no puede exceder 60 caracteres.")
        .regex(nombreRegex, "El nombre del tutor solo debe contener letras y espacios.")
        .refine((val) => !/(.)\1\1/.test(val), "No puedes repetir la misma letra más de 2 veces seguidas.")
        .refine((val) => /^[A-ZÁÉÍÓÚÑ]/.test(val), "El nombre debe comenzar con mayúscula."),
    tutorTelefono: z.string()
        .regex(telefonoNicaRegex, "El teléfono debe ser un celular válido (empieza con 5, 7 u 8) y tener 8 dígitos."),
    direccion: z.string()
        .min(10, "La dirección debe ser detallada (mínimo 10 caracteres).")
        .regex(direccionRegex, "La dirección solo puede contener letras y números."),
    precio: z.coerce.number()
        .gt(700, "El precio mensual debe ser MAYOR a 700 C$.") 
        .max(50000, "El precio excede el límite permitido."),
});

const hermanoSchema = z.object({
    nombre: z.string()
        .min(3, "Nombre de hermano muy corto.")
        .regex(nombreRegex, "Solo letras.")
        .refine((val) => !/(.)\1\1/.test(val), "No repitas letras excesivamente.")
        .refine((val) => /^[A-ZÁÉÍÓÚÑ]/.test(val), "Debe comenzar con mayúscula."),
    grado: z.string().min(1, "Selecciona el grado."),
    vehiculoId: z.string().min(1, "Selecciona el vehículo."),
});

// --- MENÚ ---
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

type Vehiculo = { id: string; nombre: string; };

export default function NuevoAlumnoPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    
    const [formData, setFormData] = useState({
        nombre: "", tutorNombre: "", tutorTelefono: "", grado: "", direccion: "", vehiculoId: "", 
        precio: "700", // <-- Valor por defecto 700
        hermanos: false,
    });
    const [otrosHijos, setOtrosHijos] = useState<{ nombre: string; grado: string; vehiculoId: string }[]>([]);

    useEffect(() => {
        const fetchVehiculos = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                if (!token) return; 
                const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos?estado=activo`, { headers });
                if (response.ok) { const data = await response.json(); setVehiculos(data); }
            } catch (err) { console.error("Error vehículos", err); }
        };
        fetchVehiculos();
    }, []);

    const calcularPrecios = (total: number, cant: number) => {
        const base = Math.floor(total / cant);
        const resto = total % cant;
        const p = Array(cant).fill(base);
        p[0] += resto; return p;
    };

    // Helper para capitalizar palabras (Title Case)
    const toTitleCase = (str: string) => {
        return str.replace(/(^|\s)[a-zñáéíóú]/g, (c) => c.toUpperCase());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const valid = formularioSchema.parse(formData); // Validación final estricta

            if (formData.hermanos) {
                if (otrosHijos.length === 0) throw new Error("Marcaste hermanos pero la lista está vacía.");
                otrosHijos.forEach((h, i) => { try { hermanoSchema.parse(h); } catch (e:any) { throw new Error(`Hermano ${i+1}: ${e.errors[0].message}`); } });
            }

            const lista = [{ nombre: valid.nombre, grado: valid.grado, vehiculoId: valid.vehiculoId }, ...otrosHijos];
            const precios = calcularPrecios(valid.precio, lista.length);
            const { data: { session } } = await supabase.auth.getSession();
            
            const headers = { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' };

            for (const [i, al] of lista.entries()) {
                const payload = {
                    nombre: al.nombre.trim(), grado: al.grado, 
                    tutor: { nombre: valid.tutorNombre.trim(), telefono: valid.tutorTelefono.trim() },
                    direccion: valid.direccion.trim(), vehiculoId: al.vehiculoId, precio: precios[i], activo: true
                };
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos`, { method: 'POST', headers, body: JSON.stringify(payload) });
                if (!res.ok) throw new Error(`Falló registro de ${al.nombre}`);
            }

            toast({ title: "¡Éxito!", description: "Familia registrada correctamente.", className: "bg-green-600 text-white" });
            router.push("/dashboard/propietario/alumnos");

        } catch (err: any) {
            toast({ title: "Error", description: err instanceof z.ZodError ? err.errors[0].message : err.message, variant: "destructive" });
        } finally { setLoading(false); }
    };

    return (
        <DashboardLayout title="Registrar Alumno" menuItems={menuItems}>
            <div className="space-y-6">
                <Link href="/dashboard/propietario/alumnos"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4"/> Volver</Button></Link>
                <Card>
                    <CardHeader><CardTitle>Ingreso de Nuevo Alumno</CardTitle><CardDescription>Registra estudiante y familia.</CardDescription></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Nombre Alumno *</Label>
                                    <Input 
                                        value={formData.nombre} 
                                        placeholder="Ej: Juan Pablo"
                                        onChange={(e) => { 
                                            const val = e.target.value;
                                            if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/.test(val)) return;
                                            if (/(.)\1\1/.test(val)) return; // Anti-spam repetición
                                            
                                            // Auto Capitalize
                                            setFormData({...formData, nombre: toTitleCase(val)}); 
                                        }} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Grado *</Label>
                                    <Select value={formData.grado} onValueChange={(v)=>setFormData({...formData, grado: v})}>
                                        <SelectTrigger><SelectValue placeholder="Grado"/></SelectTrigger>
                                        <SelectContent>{["1° Preescolar","2° Preescolar","3° Preescolar","1° Primaria","2° Primaria","3° Primaria","4° Primaria","5° Primaria","6° Primaria"].map(g=><SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Nombre Tutor *</Label>
                                    <Input 
                                        value={formData.tutorNombre} 
                                        placeholder="Ej: Ricardo Leandro Martin Perez"
                                        onChange={(e) => { 
                                            const val = e.target.value;
                                            if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/.test(val)) return;
                                            if (/(.)\1\1/.test(val)) return;

                                            setFormData({...formData, tutorNombre: toTitleCase(val)}); 
                                        }} 
                                    />
                                </div>
                                
                                {/* 🚀 VALIDACIÓN ESTRICTA TELÉFONO EN VIVO */}
                                <div className="space-y-2">
                                    <Label>Teléfono Tutor *</Label>
                                    <Input type="tel" maxLength={8} value={formData.tutorTelefono} placeholder="Ej: 88888888"
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, ''); // Solo números
                                            // Si quiere ser muy estricto y bloquear en vivo el primer dígito incorrecto:
                                            if (val.length === 1 && !['5','7','8'].includes(val)) {
                                                return; 
                                            }
                                            setFormData({...formData, tutorTelefono: val});
                                        }} />
                                    <p className="text-[10px] text-muted-foreground">8 dígitos. Debe iniciar con 5, 7 u 8.</p>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label>Dirección *</Label>
                                    <Input value={formData.direccion} placeholder="Direccion detallada ej: Calle Sacuanjoche 3 cuadras al sur media hacia arriba."
                                        onChange={(e) => { if (/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s]*$/.test(e.target.value)) setFormData({...formData, direccion: e.target.value}); }} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Vehículo *</Label>
                                    <Select value={formData.vehiculoId} onValueChange={(v)=>setFormData({...formData, vehiculoId: v})}>
                                        <SelectTrigger><SelectValue placeholder="Vehículo"/></SelectTrigger>
                                        <SelectContent>{vehiculos.map(v=><SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>

                                {/* 🚀 VALIDACIÓN PRECIO EN VIVO */}
                                <div className="space-y-2">
                                    <Label className="text-green-600 font-bold">Precio Familiar (C$) *</Label>
                                    <Input 
                                        type="number" 
                                        value={formData.precio} 
                                        placeholder="Mínimo 700"
                                        min={700} // Bloquea las flechitas hacia abajo de 700
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            // Permitimos borrar (string vacío) para editar, pero no negativos
                                            if (val !== "" && Number(val) < 0) return; 
                                            setFormData({...formData, precio: val});
                                        }} 
                                        className="border-green-200 focus:ring-green-500"
                                    />
                                    <p className="text-[10px] text-muted-foreground">Debe ser mayor a 700 al registrar.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t">
                                <Checkbox checked={formData.hermanos} onCheckedChange={(c)=>{ setFormData({...formData, hermanos: c===true}); setOtrosHijos(c ? [{nombre:"", grado:"", vehiculoId:""}] : []); }} id="h"/>
                                <Label htmlFor="h" className="cursor-pointer font-medium">¿Tiene hermanos?</Label>
                            </div>

                            {formData.hermanos && (
                                <div className="space-y-4 mt-4 border-t pt-4">
                                    {otrosHijos.map((h, i) => (
                                        <div key={i} className="grid gap-4 md:grid-cols-3 items-end border-b pb-4">
                                            <div className="space-y-2">
                                                <Label>Hermano {i+1}</Label>
                                                <Input 
                                                    value={h.nombre} 
                                                    onChange={(e)=>{ 
                                                        const val = e.target.value;
                                                        if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/.test(val)) return;
                                                        if (/(.)\1\1/.test(val)) return;

                                                        const n=[...otrosHijos]; 
                                                        n[i].nombre = toTitleCase(val); // Auto Capitalize también aquí
                                                        setOtrosHijos(n); 
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2"><Label>Grado</Label><Select value={h.grado} onValueChange={(v)=>{const n=[...otrosHijos]; n[i].grado=v; setOtrosHijos(n);}}><SelectTrigger><SelectValue placeholder="Grado"/></SelectTrigger><SelectContent>{["1° Preescolar","2° Preescolar","3° Preescolar","1° Primaria","2° Primaria","3° Primaria","4° Primaria","5° Primaria","6° Primaria"].map(g=><SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
                                            <div className="space-y-2 flex gap-2"><div className="flex-1"><Label>Vehículo</Label><Select value={h.vehiculoId} onValueChange={(v)=>{const n=[...otrosHijos]; n[i].vehiculoId=v; setOtrosHijos(n);}}><SelectTrigger><SelectValue placeholder="Vehículo"/></SelectTrigger><SelectContent>{vehiculos.map(v=><SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>)}</SelectContent></Select></div><Button type="button" variant="ghost" size="icon" className="text-red-500 mt-6" onClick={()=>{const n=[...otrosHijos]; n.splice(i,1); setOtrosHijos(n);}}><Trash2 className="h-5 w-5"/></Button></div>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={()=>setOtrosHijos([...otrosHijos, {nombre:"", grado:"", vehiculoId:""}])}><Plus className="mr-2 h-4 w-4"/> Otro hermano</Button>
                                </div>
                            )}

                            <Button type="submit" disabled={loading} className="w-full md:w-auto">{loading?<Loader2 className="mr-2 h-4 w-4 animate-spin"/>:<Save className="mr-2 h-4 w-4"/>} Registrar Familia</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}