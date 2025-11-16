"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// El Select ya no es necesario aquí
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
// Importamos el tipo Vehiculo de la página de lista
import type { Vehiculo } from "../page"; 

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

export default function EditarVehiculoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState<Partial<Vehiculo>>({});

  // --- Cargar datos del vehiculo a editar ---
  useEffect(() => {
    if (!id) return;
    const fetchVehiculo = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos/${id}`);
        if (!response.ok) {
          throw new Error("No se pudo encontrar el vehículo");
        }
        const data: Vehiculo = await response.json();
        setFormData(data);
      } catch (err: any) {
        toast({ title: "Error al cargar", description: (err as Error).message, variant: "destructive" });
        router.push("/dashboard/propietario/vehiculos");
      } finally {
        setLoadingData(false);
      }
    };
    fetchVehiculo();
  }, [id, router, toast]);

  // --- Manejadores de formulario ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // handleSelectChange ya no es necesario
  // const handleSelectChange = (name: string, value: string) => { ... };

  // --- Enviar actualización a la API ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Limpiamos el payload para no enviar datos extra
    const payload = {
      nombre: formData.nombre,
      placa: formData.placa,
      marca: formData.marca,
      modelo: formData.modelo,
      anio: Number(formData.anio) || undefined,
      capacidad: Number(formData.capacidad) || undefined,
      // 'recorridoAsignado' eliminado
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el vehículo");
      }

      toast({ title: "¡Actualizado!", description: "El vehículo se ha guardado correctamente." });
      router.push("/dashboard/propietario/vehiculos");

    } catch (err: any) {
      toast({ title: "Error al guardar", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout title="Editar Vehículo" menuItems={menuItems}>
        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Editar Vehículo" menuItems={menuItems}>
      <div className="space-y-6">
        <Link href="/dashboard/propietario/vehiculos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Editar Vehículo</CardTitle>
            <CardDescription>Ajusta los detalles de la unidad.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre o Apodo *</Label>
                  <Input 
                    id="nombre" 
                    name="nombre"
                    placeholder="Ej: Microbús 01" 
                    value={formData.nombre || ''} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="placa">Placa *</Label>
                   <Input 
                    id="placa" 
                    name="placa"
                    placeholder="Ej: M 123 456" 
                    value={formData.placa || ''} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                 <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Input 
                    id="marca" 
                    name="marca"
                    placeholder="Ej: Toyota" 
                    value={formData.marca || ''} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input 
                    id="modelo" 
                    name="modelo" 
                    placeholder="Ej: Hiace" 
                    value={formData.modelo || ''} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

               <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="anio">Año</Label>
                  <Input 
                    id="anio" 
                    name="anio" 
                    type="number" 
                    placeholder="Ej: 2018"
                    value={formData.anio || ''} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacidad">Capacidad (Asientos)</Label>
                  <Input 
                    id="capacidad" 
                    name="capacidad" 
                    type="number" 
                    placeholder="Ej: 15"
                    value={formData.capacidad || ''} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
              
              {/* --- CAMPO ELIMINADO ---
              <div className="space-y-2">
                  <Label htmlFor="recorridoAsignado">Recorrido Asignado</Label>
                  <Select ... >
                  </Select>
              </div>
              */}

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Link href="/dashboard/propietario/vehiculos">
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