"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { z } from "zod";

// --- 1. REGLAS DE SEGURIDAD (ZOD & REGEX) ---
// Misma lógica que en "Nuevo Aviso" para consistencia total.

const soloLetrasRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
const contenidoRegex = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s]+$/; 

const avisoSchema = z.object({
  titulo: z.string()
    .min(5, "El título es muy corto (mínimo 5 letras).")
    .max(40, "El título no debe exceder 40 caracteres.")
    .regex(soloLetrasRegex, "El título solo puede contener letras (Sin símbolos ni números).")
    .refine((val) => !/(.)\1\1/.test(val), {
        message: "No puedes repetir la misma letra más de 2 veces seguidas.",
    }),
  contenido: z.string()
    .min(10, "El mensaje es muy corto (mínimo 10 caracteres).")
    .max(300, "El mensaje no debe exceder 300 caracteres.")
    .regex(contenidoRegex, "Caracteres no permitidos detectados (posible riesgo de seguridad).")
    .refine((val) => !/(.)\1\1/.test(val), {
        message: "No abuses de letras repetidas (ej: 'Hoooola').",
    })
    .refine((val) => {
        // Lógica Estricta de Números (Solo Fechas 01-31)
        const numbers = val.match(/\d+/g);
        if (!numbers) return true; 
        
        return numbers.every(n => {
            if (n === "00") return false; 
            if (n.length > 2) return false; 
            const num = parseInt(n);
            return num >= 1 && num <= 31; 
        });
    }, {
      message: "Solo se permiten números para fechas (01 al 31). No se permiten años, precios o '00'.",
    }),
});

type Aviso = {
  id: string;
  titulo: string;
  contenido: string;
  destinatario: 'todos' | 'tutores' | 'personal';
  fecha: string;
  estado?: string;
};

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

export default function EditarAvisoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState<Partial<Aviso>>({});

  // Función auxiliar para validar números en tiempo real
  const validarNumerosEnVivo = (texto: string) => {
      const numeros = texto.match(/\d+/g);
      if (!numeros) return true;
      return numeros.every(n => {
          if (n === "00") return false;
          if (n.length > 2) return false; 
          if (parseInt(n) > 31) return false; 
          return true;
      });
  };

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("No hay sesión activa");
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  useEffect(() => {
    if (!id) {
      toast({ title: "Error", description: "ID de aviso no válido", variant: "destructive" });
      router.push("/dashboard/propietario/avisos");
      return;
    }

    const fetchAviso = async () => {
      try {
        setLoadingData(true);
        const headers = await getAuthHeaders();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avisos/${id}`, { headers });

        if (!response.ok) {
          if (response.status === 404) throw new Error("No se pudo encontrar el aviso");
          if (response.status === 401) throw new Error("No autorizado");
          throw new Error(`Error del servidor: ${response.status}`);
        }

        const data: Aviso = await response.json();
        setFormData(data);
        
      } catch (err: any) {
        console.error("Error al cargar aviso:", err);
        toast({ title: "Error al cargar", description: err.message, variant: "destructive" });
        router.push("/dashboard/propietario/avisos");
      } finally {
        setLoadingData(false);
      }
    };
    fetchAviso();
  }, [id, toast, router]);

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, destinatario: value as Aviso['destinatario'] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. VALIDACIÓN SEGURA CON ZOD
      // Validamos solo los campos editables (título y contenido)
      const datosValidados = avisoSchema.parse({
        titulo: formData.titulo || "",
        contenido: formData.contenido || ""
      });

      if (!formData.destinatario) {
        throw new Error("El destinatario es obligatorio.");
      }

      const payload = {
        titulo: datosValidados.titulo,
        contenido: datosValidados.contenido,
        destinatario: formData.destinatario,
      };

      const headers = await getAuthHeaders();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avisos/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "No se pudo actualizar el aviso");
      }

      toast({ title: "¡Actualizado!", description: "El aviso se ha guardado correctamente.", className: "bg-green-600 text-white" });
      setTimeout(() => { router.push("/dashboard/propietario/avisos"); }, 1000);

    } catch (err: any) {
      console.error("Error al guardar:", err);
      // Manejo de errores de Zod o generales
      const mensaje = err instanceof z.ZodError ? err.errors[0].message : err.message;
      toast({ title: "Error de Validación", description: mensaje, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout title="Editar Aviso" menuItems={menuItems}>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Cargando aviso...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Editar Aviso" menuItems={menuItems}>
      <div className="space-y-6">
        <Link href="/dashboard/propietario/avisos">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" /> Volver a la lista</Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Editar Comunicado Seguro</CardTitle>
            <CardDescription>Ajusta los detalles del aviso validado.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* TÍTULO VALIDADO */}
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input 
                  id="titulo" 
                  name="titulo"
                  placeholder="Ej: Suspensión de clases" 
                  value={formData.titulo || ''} 
                  onChange={(e) => {
                      const val = e.target.value;
                      // Whitelist: Solo letras y espacios
                      if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/.test(val)) return;
                      // Anti-repetición
                      if (/(.)\1\1/.test(val)) return;

                      setFormData(prev => ({ ...prev, titulo: val }));
                  }} 
                  required 
                  maxLength={40}
                  disabled={loading}
                />
                <p className="text-[10px] text-muted-foreground">Máx 40 caracteres. Solo letras.</p>
              </div>
              
              {/* DESTINATARIO */}
              <div className="space-y-2">
                <Label htmlFor="destinatario">Destinatario *</Label>
                <Select 
                  value={formData.destinatario || 'todos'} 
                  onValueChange={handleSelectChange}
                  required
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona a quién enviar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="tutores">Solo Tutores</SelectItem>
                    <SelectItem value="personal">Solo Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* CONTENIDO VALIDADO */}
              <div className="space-y-2">
                <Label htmlFor="contenido">Contenido del Aviso *</Label>
                <Textarea 
                  id="contenido" 
                  name="contenido"
                  placeholder="Escribe el mensaje completo aquí..." 
                  value={formData.contenido || ''} 
                  onChange={(e) => {
                      const val = e.target.value;
                      // Whitelist: Letras y números
                      if (!/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s]*$/.test(val)) return;
                      // Anti-repetición
                      if (/(.)\1\1/.test(val)) return;
                      // Validación numérica estricta
                      if (!validarNumerosEnVivo(val)) return;

                      setFormData(prev => ({ ...prev, contenido: val }));
                  }} 
                  required 
                  rows={6}
                  maxLength={300}
                  disabled={loading}
                />
                <p className="text-[10px] text-muted-foreground">Sin símbolos. Números solo para fechas (1-31).</p>
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
                      Guardar Cambios
                    </>
                  )}
                </Button>
                <Link href="/dashboard/propietario/avisos">
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