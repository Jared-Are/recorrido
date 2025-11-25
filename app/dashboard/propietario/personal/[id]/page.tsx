"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    Loader2,
    Smartphone
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase"; 
import { z } from "zod";

// --- 1. REGLAS DE NEGOCIO Y SEGURIDAD (Idénticas a Nuevo Personal) ---

const nombreRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
const telefonoNicaRegex = /^[578][0-9]{7}$/; 

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

// --- TIPOS ---
type Vehiculo = {
  id: string;
  nombre: string;
};

type Personal = {
  id: string;
  nombre: string;
  puesto: string;
  telefono: string; // Normalizamos 'contacto' a 'telefono' en el form
  salario: number;
  fechaContratacion: string; 
  estado: "activo" | "inactivo" | "eliminado";
  vehiculoId: string | null;
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

export default function EditarPersonalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  
  // Estado local del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    puesto: "Asistente",
    telefono: "",
    salario: "",
    vehiculoId: "N/A",
  });

  // --- Función Auth Headers ---
  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("No hay sesión activa");
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  // --- Cargar Datos ---
  useEffect(() => {
    if (!id) {
      toast({ title: "Error", description: "ID no válido", variant: "destructive" });
      router.push("/dashboard/propietario/personal");
      return;
    }

    const fetchDatos = async () => {
      try {
        setLoadingData(true);
        const headers = await getAuthHeaders();

        const [personalRes, vehiculosRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/personal/${id}`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos?estado=activo`, { headers })
        ]);
        
        if (!personalRes.ok) throw new Error("No se pudo cargar al empleado");

        // Cargar Vehículos (sin bloquear si falla)
        if (vehiculosRes.ok) {
            setVehiculos(await vehiculosRes.json());
        }

        const data = await personalRes.json();
        
        // Mapear datos al estado del formulario
        setFormData({
          nombre: data.nombre || "",
          puesto: data.puesto || "Asistente",
          // La API puede devolver 'contacto' o 'telefono'
          telefono: data.telefono || data.contacto || "",
          salario: data.salario ? data.salario.toString() : "4500",
          vehiculoId: data.vehiculoId || "N/A"
        });

      } catch (err: any) {
        console.error("Error:", err);
        toast({ title: "Error al cargar", description: err.message, variant: "destructive" });
        router.push("/dashboard/propietario/personal");
      } finally {
        setLoadingData(false);
      }
    };
    fetchDatos();
  }, [id, router, toast]);

  // --- Manejadores ---
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. VALIDACIÓN SEGURA CON ZOD
      const valid = personalSchema.parse(formData);

      const payload = {
        nombre: valid.nombre.trim(),
        puesto: valid.puesto,
        telefono: valid.telefono.trim(),
        salario: valid.salario,
        vehiculoId: formData.vehiculoId === "N/A" ? null : formData.vehiculoId,
        // Nota: No enviamos fechaContratacion para mantener la original intacta
      };

      const headers = await getAuthHeaders();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/personal/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "No se pudo actualizar");
      }

      toast({ title: "¡Actualizado!", description: "Datos del empleado guardados correctamente.", className: "bg-green-600 text-white" });
      setTimeout(() => { router.push("/dashboard/propietario/personal"); }, 1000);

    } catch (err: any) {
      console.error("Error:", err);
      const mensaje = err instanceof z.ZodError ? err.errors[0].message : err.message;
      toast({ title: "Error de Validación", description: mensaje, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout title="Editar Personal" menuItems={menuItems}>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Cargando datos...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Editar Personal" menuItems={menuItems}>
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
            <CardTitle>Editar Colaborador Seguro</CardTitle>
            <CardDescription>Actualiza los datos del empleado.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* NOMBRE VALIDADO */}
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input 
                    id="nombre" 
                    name="nombre" 
                    placeholder="Ej: Carlos Pérez" 
                    value={formData.nombre} 
                    onChange={(e) => {
                        const val = e.target.value;
                        // 1. Whitelist (Solo letras y espacios)
                        if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/.test(val)) return;
                        // 2. Anti-repetición
                        if (/(.)\1\1/.test(val)) return;

                        // 3. Auto-capitalizar (Title Case)
                        const valFormatted = val.replace(/(^|\s)[a-zñáéíóú]/g, (c) => c.toUpperCase());

                        setFormData({ ...formData, nombre: valFormatted });
                    }} 
                    required 
                    disabled={loading}
                  />
                  <p className="text-[10px] text-muted-foreground">Solo letras. Formato Nombre Propio.</p>
                </div>

                {/* TELÉFONO VALIDADO */}
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
                        disabled={loading}
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
                    disabled={loading}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecciona un puesto" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Asistente">Asistente</SelectItem>
                        <SelectItem value="Chofer">Chofer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* SALARIO VALIDADO */}
                <div className="space-y-2">
                  <Label htmlFor="salario">Salario Mensual (C$) *</Label>
                  <Input 
                    id="salario" 
                    name="salario" 
                    type="number" 
                    placeholder="4500 - 12000" 
                    min={4500} // Bloqueo visual de flechas
                    max={12000}
                    value={formData.salario} 
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        // Permitir borrar para editar, bloquear negativos y > 12000
                        if (e.target.value !== "" && val < 0) return;
                        if (val > 12000) return; 
                        
                        setFormData({ ...formData, salario: e.target.value });
                    }} 
                    disabled={loading}
                  />
                  <p className="text-[10px] text-muted-foreground">Rango: 4,500 - 12,000 C$.</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                 {/* VEHÍCULO */}
                 <div className="space-y-2">
                    <Label htmlFor="vehiculoId">Vehículo Asignado (Opcional)</Label>
                    <Select 
                        value={formData.vehiculoId || "N/A"} 
                        onValueChange={(value) => handleSelectChange("vehiculoId", value)}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar vehículo" />
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
                  Guardar Cambios
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}