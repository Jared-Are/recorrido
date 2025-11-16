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

// --- TIPO PARA EL VEHÍCULO CARGADO ---
type Vehiculo = {
  id: string;
  nombre: string;
};

// --- DEFINICIÓN DEL TIPO ALUMNO (ACTUALIZADO) ---
export type Alumno = {
  id: string;
  nombre: string;
  tutor: string;
  grado: string;
  precio: number;
  contacto: string;
  direccion: string;
  activo: boolean;
  vehiculoId: string | null;
  vehiculo?: { 
    id: string;
    nombre: string;
  }
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


export default function EditarAlumnoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  
  const [formData, setFormData] = useState<Partial<Alumno>>({
    nombre: "",
    tutor: "",
    grado: "",
    contacto: "",
    direccion: "",
    vehiculoId: "", 
    precio: 0,
  });

  // --- OBTENER DATOS DEL ALUMNO Y VEHÍCULOS ---
  useEffect(() => {
    if (!id) return;

    const fetchDatos = async () => {
      try {
        const [alumnoRes, vehiculosRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos/${id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos?estado=activo`)
        ]);

        if (!alumnoRes.ok) {
          throw new Error("No se pudo encontrar el alumno");
        }
        if (!vehiculosRes.ok) {
          throw new Error("No se pudieron cargar los vehículos");
        }
        
        const data: Alumno = await alumnoRes.json();
        const dataVehiculos: Vehiculo[] = await vehiculosRes.json();

        setVehiculos(dataVehiculos);
        setFormData({
          ...data,
          vehiculoId: data.vehiculoId || "" // Asignar "" si es nulo
        });
      } catch (err: any) {
        toast({
          title: "Error al cargar",
          description: (err as Error).message,
          variant: "destructive",
        });
        router.push("/dashboard/propietario/alumnos");
      } finally {
        setLoadingData(false);
      }
    };
    fetchDatos();
  }, [id, router, toast]);

  // --- MANEJADORES DE FORMULARIO ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // --- ACTUALIZAR EN LA API ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // --- PAYLOAD LIMPIO Y ACTUALIZADO ---
      const payload = {
        nombre: formData.nombre,
        tutor: formData.tutor,
        grado: formData.grado,
        contacto: formData.contacto,
        direccion: formData.direccion,
        vehiculoId: formData.vehiculoId, 
        precio: Number(formData.precio),
      };

      if (!payload.vehiculoId) {
       toast({ title: "Error de validación", description: "Por favor, selecciona un vehículo.", variant: "destructive" });
       setLoading(false);
       return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error de la API:", errorData);
        throw new Error(errorData.message || "No se pudo actualizar el alumno");
      }

      toast({
        title: "¡Actualizado!",
        description: "El alumno se ha guardado correctamente.",
      });
      router.push("/dashboard/propietario/alumnos");

    } catch (err: any) {
      toast({
        title: "Error al guardar",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout title="Editar Alumno" menuItems={menuItems}>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  // --- RENDERIZADO DEL FORMULARIO DE EDICIÓN ---
  return (
    <DashboardLayout title="Editar Alumno" menuItems={menuItems}>
      <div className="space-y-6">
        <Link href="/dashboard/propietario/alumnos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Editar Alumno</CardTitle>
            <CardDescription>Actualiza los datos de {formData.nombre}.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input id="nombre" name="nombre" value={formData.nombre || ''} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutor">Nombre del Tutor *</Label>
                  <Input id="tutor" name="tutor" value={formData.tutor || ''} onChange={handleChange} required />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion">Dirección *</Label>
                  <Input id="direccion" name="direccion" value={formData.direccion || ''} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grado">Grado *</Label>
                  <Select value={formData.grado || ''} onValueChange={(value) => handleSelectChange("grado", value)}>
                    <SelectTrigger><SelectValue placeholder="Selecciona el grado" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1° Preescolar">1° Preescolar</SelectItem>
                      <SelectItem value="2° Preescolar">2° Preescolar</SelectItem>
                      <SelectItem value="3° Preescolar">3° Preescolar</SelectItem>
                      <SelectItem value="1° Primaria">1° Primaria</SelectItem>
                      <SelectItem value="2° Primaria">2° Primaria</SelectItem>
                      <SelectItem value="3° Primaria">3° Primaria</SelectItem>
                      <SelectItem value="4° Primaria">4° Primaria</SelectItem>
                      <SelectItem value="5° Primaria">5° Primaria</SelectItem>
                      <SelectItem value="6° Primaria">6° Primaria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contacto">Teléfono de Contacto *</Label>
                  <Input id="contacto" name="contacto" type="tel" value={formData.contacto || ''} onChange={handleChange} required />
                </div>
              </div>

              {/* --- SELECTOR DE VEHÍCULO (DINÁMICO) --- */}
              <div className="space-y-2">
                <Label>Asignar Vehículo *</Label>
                <Select
                  name="vehiculoId" 
                  value={formData.vehiculoId || ''} 
                  onValueChange={(value) => handleSelectChange("vehiculoId", value)} 
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* --- ERROR ARREGLADO: LÍNEA ELIMINADA --- */}
                    {/* {vehiculos.length === 0 && <SelectItem value="" disabled>Cargando vehículos...</SelectItem>} */}
                    {vehiculos.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio">Precio Mensual (Individual)</Label>
                <Input id="precio" name="precio" type="number" step="0.01" value={formData.precio ?? 0} onChange={handleChange} />
                 <p className="text-xs text-muted-foreground">
                  Este es el precio individual del alumno (después de dividir entre hermanos si aplica).
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Link href="/dashboard/propietario/alumnos">
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