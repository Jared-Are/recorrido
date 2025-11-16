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
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
// import type { Personal } from "../page"; // Importamos el tipo Personal

// --- TIPO PARA EL VEHÍCULO CARGADO ---
type Vehiculo = {
  id: string;
  nombre: string;
};

// --- TIPO PERSONAL (ACTUALIZADO) ---
// Definimos el tipo aquí para no tener que importarlo
export type Personal = {
  id: string;
  nombre: string;
  puesto: string;
  contacto: string;
  salario: number;
  fechaContratacion: string; 
  estado: "activo" | "inactivo" | "eliminado";
  vehiculoId: string | null;
  vehiculo?: { 
    id: string;
    nombre: string;
  }
};

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

export default function EditarPersonalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);

  const [formData, setFormData] = useState<Partial<Personal>>({});

  // --- Cargar datos del empleado Y ADEMÁS los vehículos ---
  useEffect(() => {
    if (!id) return;
    const fetchDatos = async () => {
      try {
        const [personalRes, vehiculosRes] = await Promise.all([
           fetch(`${process.env.NEXT_PUBLIC_API_URL}/personal/${id}`),
           fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos?estado=activo`)
        ]);
        
        if (!personalRes.ok) {
          throw new Error("No se pudo encontrar al empleado");
        }
         if (!vehiculosRes.ok) {
          throw new Error("No se pudieron cargar los vehículos");
        }

        const data: Personal = await personalRes.json();
        const dataVehiculos: Vehiculo[] = await vehiculosRes.json();
        
        setVehiculos(dataVehiculos);
        setFormData({
          ...data,
          fechaContratacion: data.fechaContratacion ? new Date(data.fechaContratacion).toISOString().split('T')[0] : "", 
          salario: data.salario || 0,
          vehiculoId: data.vehiculoId || "N/A" // <-- CAMBIADO
        });
      } catch (err: any) {
        toast({ title: "Error al cargar", description: (err as Error).message, variant: "destructive" });
        router.push("/dashboard/propietario/personal");
      } finally {
        setLoadingData(false);
      }
    };
    fetchDatos();
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
      nombre: formData.nombre,
      puesto: formData.puesto,
      contacto: formData.contacto,
      salario: Number(formData.salario) || undefined,
      fechaContratacion: formData.fechaContratacion,
      vehiculoId: formData.vehiculoId === "N/A" ? null : formData.vehiculoId, // <-- CAMBIADO
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/personal/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el empleado");
      }

      toast({ title: "¡Actualizado!", description: "El empleado se ha guardado correctamente." });
      router.push("/dashboard/propietario/personal");

    } catch (err: any) {
      toast({ title: "Error al guardar", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout title="Editar Personal" menuItems={menuItems}>
        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Editar Personal" menuItems={menuItems}>
      <div className="space-y-6">
        <Link href="/dashboard/propietario/personal">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Editar Empleado</CardTitle>
            <CardDescription>Ajusta los detalles del miembro del personal.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input 
                    id="nombre" 
                    name="nombre"
                    placeholder="Ej: Ana García" 
                    value={formData.nombre || ''} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="puesto">Puesto *</Label>
                  <Select 
                    name="puesto" 
                    value={formData.puesto || ''} 
                    onValueChange={(value) => handleSelectChange("puesto", value)}
                    required
                  >
                    <SelectTrigger><SelectValue placeholder="Selecciona un puesto" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Chofer">Chofer</SelectItem>
                      <SelectItem value="Asistente">Asistente</SelectItem>
                      <SelectItem value="Administrativo">Administrativo</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                 <div className="space-y-2">
                  <Label htmlFor="contacto">Contacto (Teléfono)</Label>
                  <Input 
                    id="contacto" 
                    name="contacto"
                    type="tel"
                    placeholder="Ej: 8888-8888" 
                    value={formData.contacto || ''} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salario">Salario (C$)</Label>
                  <Input 
                    id="salario" 
                    name="salario" 
                    type="number" 
                    step="0.01"
                    placeholder="Ej: 8000.00" 
                    value={formData.salario || ''} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

               <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fechaContratacion">Fecha de Contratación</Label>
                  <Input 
                    id="fechaContratacion" 
                    name="fechaContratacion" 
                    type="date" 
                    value={formData.fechaContratacion || ''} 
                    onChange={handleChange} 
                  />
                </div>
                 {/* --- SELECTOR DE VEHÍCULO (DINÁMICO) --- */}
                <div className="space-y-2">
                  <Label htmlFor="vehiculoId">Asignar Vehículo</Label>
                  <Select 
                    name="vehiculoId" // <-- CAMBIADO
                    value={formData.vehiculoId || 'N/A'} // <-- CAMBIADO
                    onValueChange={(value) => handleSelectChange("vehiculoId", value)} // <-- CAMBIADO
                  >
                    <SelectTrigger><SelectValue placeholder="Asignar a un vehículo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/A">N/A (Sin vehículo fijo)</SelectItem>
                      {/* --- ARREGLADO --- */}
                      {/* {vehiculos.length === 0 && <SelectItem value="" disabled>Cargando...</SelectItem>} */}
                      {vehiculos.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Link href="/dashboard/propietario/personal">
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