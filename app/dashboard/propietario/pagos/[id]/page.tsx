"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Users, DollarSign, Bus, UserCog, Bell, BarChart3, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// Definimos el tipo Pago
type Pago = {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  monto: number;
  mes: string;
  fecha: string;
  estado: "pagado" | "pendiente";
};

// --- DEFINICIÓN DEL MENÚ COMPLETO ---
const menuItems: MenuItem[] = [
  {
    title: "Gestionar Alumnos",
    description: "Ver y administrar estudiantes",
    icon: Users,
    href: "/dashboard/propietario/alumnos",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "Gestionar Pagos",
    description: "Ver historial y registrar pagos",
    icon: DollarSign,
    href: "/dashboard/propietario/pagos",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    title: "Gestionar Gastos",
    description: "Control de combustible, salarios, etc.",
    icon: TrendingDown,
    href: "/dashboard/propietario/gastos",
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
  },
  {
    title: "Gestionar Personal",
    description: "Administrar empleados y choferes",
    icon: Users,
    href: "/dashboard/propietario/personal",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    title: "Gestionar Vehículos",
    description: "Administrar flota de vehículos",
    icon: Bus,
    href: "/dashboard/propietario/vehiculos",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    title: "Gestionar Usuarios",
    description: "Administrar accesos al sistema",
    icon: UserCog,
    href: "/dashboard/propietario/usuarios",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    title: "Enviar Avisos",
    description: "Comunicados a tutores y personal",
    icon: Bell,
    href: "/dashboard/propietario/avisos",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  {
    title: "Generar Reportes",
    description: "Estadísticas y análisis",
    icon: BarChart3,
    href: "/dashboard/propietario/reportes",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
];

export default function EditarPagoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState<Partial<Pago>>({
    alumnoNombre: "",
    monto: 0,
    mes: "",
    fecha: "",
    estado: "pendiente",
  });

  // --- Cargar datos del pago a editar ---
  useEffect(() => {
    if (!id) return;
    const fetchPago = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pagos/${id}`);
        if (!response.ok) {
          throw new Error("No se pudo encontrar el pago");
        }
        const data: Pago = await response.json();
        setFormData({
          ...data,
          fecha: data.fecha ? new Date(data.fecha).toISOString().split('T')[0] : "", 
        });
      } catch (err: any) {
        toast({ title: "Error al cargar", description: err.message, variant: "destructive" });
        router.push("/dashboard/propietario/pagos");
      } finally {
        setLoadingData(false);
      }
    };
    fetchPago();
  }, [id, router, toast]);

  // --- Manejadores de formulario ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Enviar actualización a la API ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      monto: Number(formData.monto),
      mes: formData.mes,
      estado: formData.estado,
      fecha: formData.estado === 'pagado' ? formData.fecha : null,
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pagos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el pago");
      }

      toast({ title: "¡Actualizado!", description: "El pago se ha guardado correctamente." });
      router.push("/dashboard/propietario/pagos");

    } catch (err: any) {
      toast({ title: "Error al guardar", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout title="Editar Pago" menuItems={menuItems}>
        <div className="flex justify-center items-center h-64"><p>Cargando datos del pago...</p></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Editar Pago" menuItems={menuItems}>
      <div className="space-y-6">
        <Link href="/dashboard/propietario/pagos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Editar Pago</CardTitle>
            <CardDescription>Ajusta los detalles del pago de {formData.alumnoNombre}.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-2">
                <Label>Alumno</Label>
                <Input value={formData.alumnoNombre} disabled />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mes">Mes de Pago *</Label>
                  <Input id="mes" name="mes" value={formData.mes} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto (C$) *</Label>
                  <Input id="monto" name="monto" type="number" value={formData.monto} onChange={handleChange} required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Select value={formData.estado} onValueChange={(value) => handleSelectChange("estado", value)} required>
                    <SelectTrigger><SelectValue placeholder="Selecciona un estado" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="pagado">Pagado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.estado === 'pagado' && (
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha de Pago *</Label>
                    <Input id="fecha" name="fecha" type="date" value={formData.fecha ?? ''} onChange={handleChange} required />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Link href="/dashboard/propietario/pagos">
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