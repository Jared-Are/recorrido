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
import { supabase } from "@/lib/supabase"; // Importar Supabase
import type { Gasto } from "../page";

// --- TIPOS ---
type Vehiculo = {
  id: string;
  nombre: string;
};

type Personal = {
  id: string;
  nombre: string;
  salario: number;
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

// Helper de formato de moneda
const formatCurrency = (num: number) => {
  return (num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function EditarGastoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [personal, setPersonal] = useState<Personal[]>([]); 
  
  const [formData, setFormData] = useState<Partial<Gasto>>({});

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

  // --- Cargar datos del gasto, vehículos y personal (CORREGIDO) ---
  useEffect(() => {
    if (!id) {
      toast({
        title: "Error",
        description: "ID de gasto no válido",
        variant: "destructive"
      });
      router.push("/dashboard/propietario/gastos");
      return;
    }

    const fetchDatos = async () => {
      try {
        setLoadingData(true);
        
        // Obtener headers con autenticación
        const headers = await getAuthHeaders();
        
        const [gastoRes, vehiculosRes, personalRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/gastos/${id}`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos?estado=activo`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/personal?estado=activo`, { headers })
        ]);

        // Manejo de respuestas
        if (!gastoRes.ok) {
          if (gastoRes.status === 404) {
            throw new Error("No se pudo encontrar el gasto");
          } else if (gastoRes.status === 401) {
            throw new Error("No autorizado - por favor inicia sesión nuevamente");
          } else {
            throw new Error(`Error del servidor: ${gastoRes.status}`);
          }
        }

        if (!vehiculosRes.ok) {
          console.warn("No se pudieron cargar los vehículos, pero continuamos...");
        }

        if (!personalRes.ok) {
          console.warn("No se pudo cargar la lista de personal, pero continuamos...");
        }

        const data: Gasto = await gastoRes.json();
        const dataVehiculos: Vehiculo[] = vehiculosRes.ok ? await vehiculosRes.json() : [];
        const dataPersonal: Personal[] = personalRes.ok ? await personalRes.json() : [];
        
        setVehiculos(dataVehiculos);
        setPersonal(dataPersonal);
        setFormData({
          ...data,
          fecha: data.fecha ? new Date(data.fecha).toISOString().split('T')[0] : "", 
          monto: data.monto || 0,
          vehiculoId: data.vehiculoId || "N/A",
          personalId: data.personalId || "N/A", 
        });

      } catch (err: any) {
        console.error("Error al cargar datos:", err);
        toast({ 
          title: "Error al cargar", 
          description: err.message, 
          variant: "destructive" 
        });
        router.push("/dashboard/propietario/gastos");
      } finally {
        setLoadingData(false);
      }
    };
    fetchDatos();
  }, [id, router, toast]);

  // --- Manejadores de formulario ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "categoria" && value === "salarios") {
      setFormData(prev => ({ 
        ...prev, 
        categoria: value, 
        descripcion: "Pago de salario: ",
        vehiculoId: "N/A",
      }));
    } else if (name === "personalId" && formData.categoria === "salarios") {
      const empleado = personal.find(p => p.id === value);
      if (empleado) {
        setFormData(prev => ({
          ...prev,
          personalId: value,
          monto: (empleado.salario || 0),
          descripcion: `Pago de salario: ${empleado.nombre}`
        }));
      } else {
         setFormData(prev => ({ 
          ...prev,
          personalId: "N/A",
          monto: 0,
          descripcion: `Pago de salario: `
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // --- Enviar actualización a la API (CORREGIDO) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones
      if (!formData.descripcion?.trim()) {
        toast({ 
          title: "Error de validación", 
          description: "La descripción es obligatoria", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      if (!formData.categoria) {
        toast({ 
          title: "Error de validación", 
          description: "La categoría es obligatoria", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      if (!formData.monto || formData.monto <= 0) {
        toast({ 
          title: "Error de validación", 
          description: "El monto debe ser mayor a cero", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      if (!formData.fecha) {
        toast({ 
          title: "Error de validación", 
          description: "La fecha es obligatoria", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      const esSalario = formData.categoria === 'salarios';
      const esSalarioManual = esSalario && formData.personalId === "N/A";

      if (esSalario && !formData.personalId) {
        toast({ 
          title: "Error de validación", 
          description: "Por favor, selecciona un empleado o 'N/A (Registrar salario manual)'", 
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

      const payload = {
        descripcion: formData.descripcion.trim(),
        categoria: formData.categoria,
        monto: Number(formData.monto),
        fecha: formData.fecha,
        vehiculoId: formData.vehiculoId === "N/A" ? null : formData.vehiculoId,
        personalId: formData.personalId === "N/A" ? null : formData.personalId,
      };

      console.log("📤 Enviando payload:", payload);

      // Obtener headers con autenticación
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gastos/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "No se pudo actualizar el gasto");
      }

      toast({ 
        title: "¡Actualizado!", 
        description: "El gasto se ha guardado correctamente." 
      });
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push("/dashboard/propietario/gastos");
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
      <DashboardLayout title="Editar Gasto" menuItems={menuItems}>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Cargando datos del gasto...</span>
        </div>
      </DashboardLayout>
    );
  }
  
  const esSalario = formData.categoria === 'salarios';
  const esSalarioManual = esSalario && formData.personalId === "N/A";

  return (
    <DashboardLayout title="Editar Gasto" menuItems={menuItems}>
      <div className="space-y-6">
        <Link href="/dashboard/propietario/gastos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Editar Gasto</CardTitle>
            <CardDescription>Ajusta los detalles del gasto operativo.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea 
                  id="descripcion" 
                  name="descripcion"
                  placeholder="Ej: Llenado de tanque de Microbús 01" 
                  value={formData.descripcion || ''} 
                  onChange={handleChange} 
                  required 
                  disabled={loading || (esSalario && !esSalarioManual)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select 
                    value={formData.categoria || ''} 
                    onValueChange={(value) => handleSelectChange("categoria", value)}
                    required
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="combustible">Combustible</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="salarios">Salarios</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="vehiculoId">Asignar Vehículo</Label>
                  <Select 
                    value={formData.vehiculoId || 'N/A'} 
                    onValueChange={(value) => handleSelectChange("vehiculoId", value)}
                    disabled={loading || esSalario}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Asignar a un vehículo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/A">N/A (Gasto General)</SelectItem>
                      {vehiculos.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {esSalario && (
                    <p className="text-xs text-muted-foreground">Los salarios no se asignan a vehículos.</p>
                   )}
                </div>
              </div>

              {esSalario && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="personalId">Asignar Empleado *</Label>
                  <Select 
                    value={formData.personalId || "N/A"} 
                    onValueChange={(value) => handleSelectChange("personalId", value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/A">N/A (Registrar salario manual)</SelectItem>
                      {personal.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nombre} (Salario: C${formatCurrency(p.salario || 0)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto (C$) *</Label>
                  <Input 
                    id="monto" 
                    name="monto" 
                    type="number" 
                    step="0.01"
                    placeholder={esSalario && !esSalarioManual ? "Se llenará automáticamente" : "Ej: 1500.00"}
                    value={formData.monto || ''} 
                    onChange={handleChange} 
                    required 
                    disabled={loading || (esSalario && !esSalarioManual)}
                  />
                   {esSalario && !esSalarioManual && (
                    <p className="text-xs text-muted-foreground">El monto se toma automáticamente del salario del empleado.</p>
                   )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha del Gasto *</Label>
                  <Input 
                    id="fecha" 
                    name="fecha" 
                    type="date" 
                    value={formData.fecha || ''} 
                    onChange={handleChange} 
                    required 
                    disabled={loading}
                  />
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
                <Link href="/dashboard/propietario/gastos">
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