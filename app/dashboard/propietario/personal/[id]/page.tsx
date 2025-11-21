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
import { supabase } from "@/lib/supabase"; // Importar Supabase

// --- TIPO PARA EL VEHÍCULO CARGADO ---
type Vehiculo = {
  id: string;
  nombre: string;
};

// --- TIPO PERSONAL (ACTUALIZADO) ---
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
  const [vehiculosLoading, setVehiculosLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<Personal>>({});

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

  // --- Cargar datos del empleado Y los vehículos ---
  useEffect(() => {
    if (!id) {
      toast({
        title: "Error",
        description: "ID de empleado no válido",
        variant: "destructive"
      });
      router.push("/dashboard/propietario/personal");
      return;
    }

    const fetchDatos = async () => {
      try {
        setLoadingData(true);
        
        // Obtener headers de autenticación
        const headers = await getAuthHeaders();

        // Hacer ambas peticiones en paralelo
        const [personalRes, vehiculosRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/personal/${id}`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos?estado=activo`, { headers })
        ]);
        
        // Verificar respuesta del empleado
        if (!personalRes.ok) {
          if (personalRes.status === 404) {
            throw new Error("No se pudo encontrar al empleado");
          } else if (personalRes.status === 401) {
            throw new Error("No autorizado - por favor inicia sesión nuevamente");
          } else {
            throw new Error(`Error del servidor: ${personalRes.status}`);
          }
        }

        // Verificar respuesta de vehículos
        if (!vehiculosRes.ok) {
          console.warn("No se pudieron cargar los vehículos, pero continuamos...");
          // No lanzamos error aquí para no bloquear la edición
        }

        const data: Personal = await personalRes.json();
        const dataVehiculos: Vehiculo[] = vehiculosRes.ok ? await vehiculosRes.json() : [];
        
        setVehiculos(dataVehiculos);
        setFormData({
          ...data,
          fechaContratacion: data.fechaContratacion ? new Date(data.fechaContratacion).toISOString().split('T')[0] : "",
          salario: data.salario || 0,
          vehiculoId: data.vehiculoId || "N/A"
        });

      } catch (err: any) {
        console.error("Error al cargar datos:", err);
        toast({ 
          title: "Error al cargar", 
          description: err.message, 
          variant: "destructive" 
        });
        router.push("/dashboard/propietario/personal");
      } finally {
        setLoadingData(false);
        setVehiculosLoading(false);
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

    try {
      // Validaciones básicas
      if (!formData.nombre?.trim()) {
        toast({
          title: "Error de validación",
          description: "El nombre es obligatorio",
          variant: "destructive"
        });
        return;
      }

      if (!formData.puesto) {
        toast({
          title: "Error de validación",
          description: "El puesto es obligatorio",
          variant: "destructive"
        });
        return;
      }

      const payload = {
        nombre: formData.nombre.trim(),
        puesto: formData.puesto,
        contacto: formData.contacto?.trim() || null,
        salario: formData.salario ? Number(formData.salario) : null,
        fechaContratacion: formData.fechaContratacion,
        vehiculoId: formData.vehiculoId === "N/A" ? null : formData.vehiculoId,
      };

      // Obtener headers con autenticación
      const headers = await getAuthHeaders();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/personal/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "No se pudo actualizar el empleado");
      }

      toast({ 
        title: "¡Actualizado!", 
        description: "El empleado se ha guardado correctamente." 
      });
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push("/dashboard/propietario/personal");
      }, 1000);

    } catch (err: any) {
      console.error("Error al guardar:", err);
      toast({ 
        title: "Error al guardar", 
        description: err.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout title="Editar Personal" menuItems={menuItems}>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Cargando datos del empleado...</span>
        </div>
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
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="puesto">Puesto *</Label>
                  <Select 
                    value={formData.puesto || ''} 
                    onValueChange={(value) => handleSelectChange("puesto", value)}
                    required
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un puesto" />
                    </SelectTrigger>
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vehiculoId">Asignar Vehículo</Label>
                  <Select 
                    value={formData.vehiculoId || 'N/A'}
                    onValueChange={(value) => handleSelectChange("vehiculoId", value)}
                    disabled={loading || vehiculosLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        vehiculosLoading ? "Cargando vehículos..." : "Asignar a un vehículo"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/A">N/A (Sin vehículo fijo)</SelectItem>
                      {vehiculos.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Solo se muestran vehículos activos
                  </p>
                </div>
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
                <Link href="/dashboard/propietario/personal">
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