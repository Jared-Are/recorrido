"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Users, DollarSign, Bus, UserCog, Bell, BarChart3, TrendingDown, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

// --- 1. REGLAS DE SEGURIDAD (ZOD & REGEX) ---

// Whitelist: Solo permitimos caracteres seguros. 
// Título: Solo letras. Contenido: Letras y números.
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
        if (!numbers) return true; // Si no hay números, todo bien
        
        return numbers.every(n => {
            if (n === "00") return false; // Bloquea 00 explícito
            if (n.length > 2) return false; // Bloquea 3 dígitos o más (ej: 100, 2024)
            const num = parseInt(n);
            return num >= 1 && num <= 31; // Solo días del mes
        });
    }, {
      message: "Solo se permiten números para fechas (01 al 31). No se permiten años, precios o '00'.",
    }),
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

type DestinatarioTipo = "tutores" | "personal";

export default function NuevoAvisoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    destinatarios: [] as DestinatarioTipo[], 
  })

  // Función auxiliar para validar números en tiempo real (mientras escribes)
  const validarNumerosEnVivo = (texto: string) => {
      const numeros = texto.match(/\d+/g);
      if (!numeros) return true;
      return numeros.every(n => {
          if (n === "00") return false; // Bloquea 00
          if (n.length > 2) return false; // Bloquea más de 2 dígitos (ej 100)
          if (parseInt(n) > 31) return false; // Bloquea > 31 (ej 32, 99)
          return true;
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. VALIDACIÓN SEGURA CON ZOD
      const datosValidados = avisoSchema.parse({
        titulo: formData.titulo,
        contenido: formData.contenido
      });

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) throw new Error("No hay sesión activa. Por favor, inicia sesión nuevamente.");

      // LÓGICA DESTINATARIOS
      let destinatario: 'todos' | 'tutores' | 'personal' = 'todos';
      const hasTutores = formData.destinatarios.includes('tutores');
      const hasPersonal = formData.destinatarios.includes('personal');

      if (hasTutores && !hasPersonal) destinatario = 'tutores';
      if (!hasTutores && hasPersonal) destinatario = 'personal';

      const payload = {
        titulo: datosValidados.titulo,
        contenido: datosValidados.contenido,
        destinatario: destinatario,
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avisos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 401) throw new Error("Sesión expirada.");
        throw new Error(errorData?.message?.toString() || `Error ${response.status}`);
      }

      toast({ title: "✅ Aviso enviado", description: "El aviso ha sido enviado correctamente.", className: "bg-green-600 text-white" })
      router.push("/dashboard/propietario/avisos")

    } catch (err: any) {
      console.error(err);
      const mensaje = err instanceof z.ZodError ? err.errors[0].message : err.message;
      toast({ title: "Error de Validación", description: mensaje, variant: "destructive" });
    } finally {
      setLoading(false)
    }
  }

  const toggleDestinatario = (tipo: DestinatarioTipo) => {
    setFormData({
      ...formData,
      destinatarios: formData.destinatarios.includes(tipo)
        ? formData.destinatarios.filter((d) => d !== tipo)
        : [...formData.destinatarios, tipo],
    })
  }

  return (
    <DashboardLayout title="Enviar Nuevo Aviso" menuItems={menuItems}>
      <div className="space-y-6">
        <Link href="/dashboard/propietario/avisos">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" /> Volver a la lista</Button>
        </Link>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Enviar Aviso Seguro</CardTitle>
            <CardDescription>Crea un comunicado validado para tutores o personal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* TÍTULO VALIDADO */}
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    placeholder="Ej: Inicio de clases"
                    value={formData.titulo}
                    onChange={(e) => {
                        const val = e.target.value;
                        // 1. Whitelist (Solo letras)
                        if (!/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/.test(val)) return;
                        
                        // 2. Anti Repetición (Máx 2 letras iguales seguidas)
                        if (/(.)\1\1/.test(val)) return;

                        setFormData({ ...formData, titulo: val })
                    }}
                    required
                    disabled={loading}
                    maxLength={40}
                  />
                  <p className="text-[10px] text-muted-foreground">Máx 40 caracteres.</p>
                </div>
                
                {/* CONTENIDO VALIDADO */}
                <div className="space-y-2">
                  <Label htmlFor="contenido">Mensaje *</Label>
                  <Textarea
                    id="contenido"
                    placeholder="Escribe el mensaje..."
                    value={formData.contenido}
                    onChange={(e) => {
                        const val = e.target.value;
                        
                        // 1. Whitelist (Letras y números)
                        if (!/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s]*$/.test(val)) return;
                        
                        // 2. Anti Repetición
                        if (/(.)\1\1/.test(val)) return;

                        // 3. Validación Numérica Estricta (Fechas 01-31)
                        if (!validarNumerosEnVivo(val)) return;

                        setFormData({ ...formData, contenido: val })
                    }}
                    rows={4}
                    required
                    disabled={loading}
                    maxLength={300}
                  />
                  <p className="text-[10px] text-muted-foreground">Números solo fechas (1-31).</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Destinatarios</Label>
                  <p className="text-xs text-muted-foreground">Si no seleccionas ninguno, se enviará a 'todos' por defecto.</p>
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="tutores" checked={formData.destinatarios.includes("tutores")} onCheckedChange={() => toggleDestinatario("tutores")} disabled={loading} />
                      <label htmlFor="tutores" className="text-sm cursor-pointer">Tutores</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="personal" checked={formData.destinatarios.includes("personal")} onCheckedChange={() => toggleDestinatario("personal")} disabled={loading} />
                      <label htmlFor="personal" className="text-sm cursor-pointer">Personal</label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    {loading ? "Enviando..." : "Enviar Aviso"}
                  </Button>
                   <Link href="/dashboard/propietario/avisos">
                      <Button type="button" variant="outline" disabled={loading}>Cancelar</Button>
                   </Link>
                </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}