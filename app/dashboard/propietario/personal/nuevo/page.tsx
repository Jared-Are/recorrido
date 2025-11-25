"use client";

import { useState, useEffect } from "react"; 
import { useRouter } from "next/navigation";
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Users, DollarSign, Bus, UserCog, Bell, BarChart3, TrendingDown, Loader2, Smartphone, Calendar } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

// --- 1. REGLAS DE NEGOCIO Y SEGURIDAD ---

const nombreRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
const telefonoNicaRegex = /^[578][0-9]{7}$/; // 8 dígitos, inicia con 5, 7 u 8

const personalSchema = z.object({
    nombre: z.string()
        .min(3, "El nombre es muy corto.")
        .max(60, "El nombre es muy largo.")
        .regex(nombreRegex, "El nombre solo debe contener letras.")
        .refine((val) => !/(.)\1\1/.test(val), {
            message: "No puedes repetir la misma letra más de 2 veces seguidas.",
        })
        .refine((val) => /^[A-ZÁÉÍÓÚÑ]/.test(val), {
            message: "El nombre debe comenzar con una letra mayúscula.",
        }),
    telefono: z.string()
        .regex(telefonoNicaRegex, "El teléfono debe ser válido (8 dígitos, inicia con 5, 7 u 8)."),
    puesto: z.enum(["Asistente", "Chofer"], {
        errorMap: () => ({ message: "El puesto solo puede ser Asistente o Chofer." }),
    }),
    salario: z.coerce.number()
        .gte(4500, "El salario debe ser mayor o igual a C$4,500.")
        .lte(12000, "El salario no puede superar los C$12,000."),
    vehiculoId: z.string().optional(),
});

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
];

type Vehiculo = { id: string; nombre: string; };

export default function NuevoPersonalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [vehiculosLoading, setVehiculosLoading] = useState(true);

  const [formData, setFormData] = useState({
    nombre: "",
    puesto: "Asistente",
    telefono: "",
    salario: "4500", // <-- Valor por defecto: 4500
    vehiculoId: "N/A",
  });

  useEffect(() => {
    const fetchVehiculos = async () => {
      setVehiculosLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos?estado=activo`, { headers });
        
        if (response.ok) {
          const data: Vehiculo[] = await response.json();
          setVehiculos(data);
        }
      } catch (err) {
        console.error("Error cargando vehículos:", err);
      } finally {
        setVehiculosLoading(false);
      }
    };
    fetchVehiculos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. VALIDACIÓN ZOD
      const valid = personalSchema.parse(formData);

      // 2. GENERACIÓN AUTOMÁTICA DE FECHA (HOY)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const fechaHoyAuto = `${year}-${month}-${day}`;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      const payload = {
        nombre: valid.nombre.trim(),
        telefono: valid.telefono.trim(),
        puesto: valid.puesto, 
        rol: valid.puesto.toLowerCase(), 
        salario: valid.salario,
        fechaContratacion: fechaHoyAuto, // Fecha generada automáticamente
        vehiculoId: formData.vehiculoId === "N/A" ? undefined : formData.vehiculoId,
      };

      const res = await fetch(`${apiUrl}/personal`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al registrar empleado");
      }

      toast({ title: "¡Registro Exitoso!", description: "El empleado ha sido registrado correctamente.", className: "bg-green-600 text-white" });
      router.push("/dashboard/propietario/personal");

    } catch (error: any) {
      console.error(error);
      const mensaje = error instanceof z.ZodError ? error.errors[0].message : error.message;
      toast({ title: "Error de Validación", description: mensaje, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Registrar Personal" menuItems={menuItems}>
      <div className="space-y-6">
        <div className="flex justify-between">
            <Link href="/dashboard/propietario/personal">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Volver a la lista
              </Button>
            </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo Colaborador Seguro</CardTitle>
            <CardDescription>Registra un nuevo empleado validado (Asistente o Chofer).</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input 
                    id="nombre" 
                    name="nombre" 
                    placeholder="Ej: Carlos Pérez" 
                    value={formData.nombre} 
                    onChange={(e) => {
                        const val = e.target.value;
                        if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/.test(val)) return;
                        if (/(.)\1\1/.test(val)) return;

                        // Auto-capitalizar estilo Título
                        const valFormatted = val.replace(/(^|\s)[a-zñáéíóú]/g, (c) => c.toUpperCase());

                        setFormData({ ...formData, nombre: valFormatted });
                    }} 
                    required 
                  />
                  <p className="text-[10px] text-muted-foreground">Solo letras. Formato Nombre Propio (Ej: Juan Pérez).</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono (WhatsApp) *</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                        id="telefono" 
                        name="telefono" 
                        placeholder="88888888" 
                        className="pl-8"
                        value={formData.telefono} 
                        maxLength={8}
                        onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length === 1 && !['5','7','8'].includes(val)) return;
                            setFormData({ ...formData, telefono: val });
                        }} 
                        required 
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">8 dígitos (Inicia con 5, 7 u 8).</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="puesto">Puesto / Rol *</Label>
                  <Select 
                    value={formData.puesto} 
                    onValueChange={(value) => handleSelectChange("puesto", value)}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecciona un puesto" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Asistente">Asistente</SelectItem>
                        <SelectItem value="Chofer">Chofer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salario">Salario Mensual (C$) *</Label>
                  <Input 
                    id="salario" 
                    name="salario" 
                    type="number" 
                    placeholder="4500 - 12000" 
                    min={4500} // BLOQUEO VISUAL: Flechas no bajan de 4500
                    max={12000}
                    value={formData.salario} 
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        // Permitimos borrar para editar (string vacío), pero no negativos.
                        if (e.target.value !== "" && val < 0) return;
                        if (val > 12000) return; 
                        handleChange(e);
                    }} 
                  />
                  <p className="text-[10px] text-muted-foreground">Rango: 4,500 - 12,000 C$.</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                 {/* Vehículo Asignado (Sin input de fecha al lado) */}
                 <div className="space-y-2">
                    <Label htmlFor="vehiculoId">Vehículo Asignado (Opcional)</Label>
                    <Select 
                        value={formData.vehiculoId} 
                        onValueChange={(value) => handleSelectChange("vehiculoId", value)}
                        disabled={vehiculosLoading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={vehiculosLoading ? "Cargando..." : "Seleccionar vehículo"} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="N/A">Ninguno / No Asignado</SelectItem>
                            {vehiculos.map(v => (
                                <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link href="/dashboard/propietario/personal">
                    <Button type="button" variant="outline" disabled={loading}>Cancelar</Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Guardar Personal
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}