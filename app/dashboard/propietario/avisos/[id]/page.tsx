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

// --- CORRECCIÓN 1: Ruta de importación ---
// Cambiado de ../../page a ../page
import type { Aviso } from "../page"; 

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

export default function EditarAvisoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState<Partial<Aviso>>({});

  // --- Cargar datos del aviso a editar ---
  useEffect(() => {
    if (!id) return;
    const fetchAviso = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avisos/${id}`);
        if (!response.ok) {
          throw new Error("No se pudo encontrar el aviso");
        }
        const data: Aviso = await response.json();
        setFormData(data);
      } catch (err: any) {
        toast({ title: "Error al cargar", description: err.message, variant: "destructive" });
        router.push("/dashboard/propietario/avisos");
      } finally {
        setLoadingData(false);
      }
    };
    fetchAviso();
  }, [id, toast, router]);

  // --- Manejadores de formulario ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // --- CORRECCIÓN 2: Tipar 'prev' ---
    setFormData((prev: Partial<Aviso>) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    // --- CORRECCIÓN 3: Tipar 'prev' ---
    setFormData((prev: Partial<Aviso>) => ({ ...prev, destinatario: value as Aviso['destinatario'] }));
  };

  // --- Enviar actualización a la API ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      titulo: formData.titulo,
      contenido: formData.contenido,
      destinatario: formData.destinatario,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avisos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el aviso");
      }

      toast({ title: "¡Actualizado!", description: "El aviso se ha guardado correctamente." });
      router.push("/dashboard/propietario/avisos");

    } catch (err: any) {
      toast({ title: "Error al guardar", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout title="Editar Aviso" menuItems={menuItems}>
        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Editar Aviso" menuItems={menuItems}>
      <div className="space-y-6">
        <Link href="/dashboard/propietario/avisos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Editar Comunicado</CardTitle>
            <CardDescription>Ajusta los detalles del aviso.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input 
                    id="titulo" 
                    name="titulo"
                    placeholder="Ej: Suspensión de clases" 
                    value={formData.titulo || ''} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="destinatario">Destinatario *</Label>
                  <Select 
                    name="destinatario" 
                    value={formData.destinatario || 'todos'} 
                    onValueChange={handleSelectChange}
                    required
                  >
                    <SelectTrigger><SelectValue placeholder="Selecciona a quién enviar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="tutores">Solo Tutores</SelectItem>
                      <SelectItem value="personal">Solo Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contenido">Contenido del Aviso *</Label>
                <Textarea 
                  id="contenido" 
                  name="contenido"
                  placeholder="Escribe el mensaje completo aquí..." 
                  value={formData.contenido || ''} 
                  onChange={handleChange} 
                  required 
                  rows={6}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Link href="/dashboard/propietario/avisos">
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