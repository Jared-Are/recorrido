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
import { supabase } from "@/lib/supabase"; // Importar Supabase para autenticación

// --- TIPO PARA EL VEHÍCULO CARGADO ---
type Vehiculo = {
  id: string;
  nombre: string;
};

// --- DEFINICIÓN DEL TIPO ALUMNO (CORREGIDO) ---
export type Alumno = {
  id: string;
  nombre: string;
  tutor: { // CORREGIDO: Tutor como objeto
    nombre: string;
    telefono: string;
  };
  grado: string;
  precio: number;
  direccion: string; // CORREGIDO: Dirección como campo separado
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
  
  // CORREGIDO: Estructura del formulario basada en la API
  const [formData, setFormData] = useState({
    nombre: "",
    tutorNombre: "",
    tutorTelefono: "",
    grado: "",
    direccion: "",
    vehiculoId: "", 
    precio: 0,
  });

  // --- Función para obtener headers con autenticación ---
  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) {
      throw new Error("No hay sesión activa");
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // --- OBTENER DATOS DEL ALUMNO Y VEHÍCULOS (CORREGIDO) ---
  useEffect(() => {
    if (!id) {
      toast({
        title: "Error",
        description: "ID de alumno no válido",
        variant: "destructive"
      });
      router.push("/dashboard/propietario/alumnos");
      return;
    }

    const fetchDatos = async () => {
      try {
        setLoadingData(true);
        
        // Obtener headers de autenticación
        const headers = await getAuthHeaders();

        const [alumnoRes, vehiculosRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos/${id}`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos?estado=activo`, { headers })
        ]);

        if (!alumnoRes.ok) {
          if (alumnoRes.status === 404) {
            throw new Error("No se pudo encontrar el alumno");
          } else if (alumnoRes.status === 401) {
            throw new Error("No autorizado - por favor inicia sesión nuevamente");
          } else {
            throw new Error(`Error del servidor: ${alumnoRes.status}`);
          }
        }

        if (!vehiculosRes.ok) {
          console.warn("No se pudieron cargar los vehículos, pero continuamos...");
        }

        const data: Alumno = await alumnoRes.json();
        const dataVehiculos: Vehiculo[] = vehiculosRes.ok ? await vehiculosRes.json() : [];

        setVehiculos(dataVehiculos);
        
        // CORREGIDO: Mapear los datos correctamente
        setFormData({
          nombre: data.nombre || "",
          tutorNombre: data.tutor?.nombre || "",
          tutorTelefono: data.tutor?.telefono || "",
          grado: data.grado || "",
          direccion: data.direccion || "",
          vehiculoId: data.vehiculoId || "",
          precio: data.precio || 0,
        });

      } catch (err: any) {
        console.error("Error al cargar datos:", err);
        toast({
          title: "Error al cargar",
          description: err.message,
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
  
  // --- ACTUALIZAR EN LA API (CORREGIDO) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones
      if (!formData.nombre.trim()) {
        toast({ title: "Error de validación", description: "El nombre es obligatorio.", variant: "destructive" });
        setLoading(false);
        return;
      }

      if (!formData.tutorNombre.trim()) {
        toast({ title: "Error de validación", description: "El nombre del tutor es obligatorio.", variant: "destructive" });
        setLoading(false);
        return;
      }

      if (!formData.tutorTelefono.trim()) {
        toast({ title: "Error de validación", description: "El teléfono del tutor es obligatorio.", variant: "destructive" });
        setLoading(false);
        return;
      }

      if (!formData.direccion.trim()) {
        toast({ title: "Error de validación", description: "La dirección es obligatoria.", variant: "destructive" });
        setLoading(false);
        return;
      }

      if (!formData.vehiculoId) {
        toast({ title: "Error de validación", description: "Por favor, selecciona un vehículo.", variant: "destructive" });
        setLoading(false);
        return;
      }

      // CORREGIDO: Payload con estructura correcta
      const payload = {
        nombre: formData.nombre.trim(),
        tutor: { // Tutor como objeto
          nombre: formData.tutorNombre.trim(),
          telefono: formData.tutorTelefono.trim()
        },
        grado: formData.grado,
        direccion: formData.direccion.trim(), // Dirección como campo separado
        vehiculoId: formData.vehiculoId, 
        precio: Number(formData.precio),
      };

      // Obtener headers con autenticación
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload), 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "No se pudo actualizar el alumno");
      }

      toast({
        title: "¡Actualizado!",
        description: "El alumno se ha guardado correctamente.",
      });
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push("/dashboard/propietario/alumnos");
      }, 1000);

    } catch (err: any) {
      console.error("Error al guardar:", err);
      toast({
        title: "Error al guardar",
        description: err.message,
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
          <span className="ml-2">Cargando datos del alumno...</span>
        </div>
      </DashboardLayout>
    );
  }

  // --- RENDERIZADO DEL FORMULARIO DE EDICIÓN (CORREGIDO) ---
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
                  <Input 
                    id="nombre" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    required 
                    disabled={loading}
                  />
                </div>

                {/* CORREGIDO: Campo separado para nombre del tutor */}
                <div className="space-y-2">
                  <Label htmlFor="tutorNombre">Nombre del Tutor *</Label>
                  <Input 
                    id="tutorNombre" 
                    name="tutorNombre" 
                    value={formData.tutorNombre} 
                    onChange={handleChange} 
                    required 
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion">Dirección *</Label>
                  <Input 
                    id="direccion" 
                    name="direccion" 
                    value={formData.direccion} 
                    onChange={handleChange} 
                    required 
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grado">Grado *</Label>
                  <Select 
                    value={formData.grado} 
                    onValueChange={(value) => handleSelectChange("grado", value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el grado" />
                    </SelectTrigger>
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

                {/* CORREGIDO: Campo separado para teléfono del tutor */}
                <div className="space-y-2">
                  <Label htmlFor="tutorTelefono">Teléfono del Tutor *</Label>
                  <Input 
                    id="tutorTelefono" 
                    name="tutorTelefono" 
                    type="tel" 
                    value={formData.tutorTelefono} 
                    onChange={handleChange} 
                    required 
                    disabled={loading}
                  />
                </div>
              </div>

              {/* --- SELECTOR DE VEHÍCULO (DINÁMICO) --- */}
              <div className="space-y-2">
                <Label>Asignar Vehículo *</Label>
                <Select
                  value={formData.vehiculoId} 
                  onValueChange={(value) => handleSelectChange("vehiculoId", value)} 
                  required
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehiculos.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio">Precio Mensual (Individual)</Label>
                <Input 
                  id="precio" 
                  name="precio" 
                  type="number" 
                  step="0.01" 
                  value={formData.precio} 
                  onChange={handleChange} 
                  disabled={loading}
                />
                 <p className="text-xs text-muted-foreground">
                  Este es el precio individual del alumno (después de dividir entre hermanos si aplica).
                </p>
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
                <Link href="/dashboard/propietario/alumnos">
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