"use client";

import { useState, useEffect } from "react"; 
import { useRouter } from "next/navigation";
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
    ArrowLeft, Save, Users, DollarSign, Bus, UserCog, Bell, 
    BarChart3, TrendingDown, Loader2, Smartphone, Calendar
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

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

type Vehiculo = { id: string; nombre: string; };

export default function NuevoPersonalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [vehiculosLoading, setVehiculosLoading] = useState(true);

  const [formData, setFormData] = useState({
    nombre: "",
    puesto: "Asistente",
    telefono: "",
    salario: "",
    fechaContratacion: new Date().toISOString().split('T')[0],
    vehiculoId: "N/A",
  });

  // 1. Cargar Vehículos al iniciar
  useEffect(() => {
    const fetchVehiculos = async () => {
      setVehiculosLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        // CORRECCIÓN: Tipado explícito para HeadersInit
        const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos?estado=activo`, { headers });
        
        if (response.ok) {
          const data: Vehiculo[] = await response.json();
          setVehiculos(data);
        } else {
          setVehiculos([]);
        }
      } catch (err) {
        console.error("Error cargando vehículos:", err);
      } finally {
        setVehiculosLoading(false);
      }
    };
    fetchVehiculos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. Enviar Datos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.nombre.trim()) {
        toast({ title: "Error", description: "El nombre es obligatorio.", variant: "destructive" });
        setLoading(false);
        return;
    }
    if (!formData.telefono.trim()) {
        toast({ title: "Error", description: "El teléfono es obligatorio.", variant: "destructive" });
        setLoading(false);
        return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      const payload = {
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        puesto: formData.puesto, 
        rol: formData.puesto.toLowerCase(), 
        salario: formData.salario ? parseFloat(formData.salario) : 0,
        fechaContratacion: formData.fechaContratacion,
        vehiculoId: formData.vehiculoId === "N/A" ? undefined : formData.vehiculoId,
      };

      const res = await fetch(`${apiUrl}/personal`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const mensaje = Array.isArray(errorData.message) 
            ? errorData.message.join(', ') 
            : errorData.message || "Error al registrar empleado";
        throw new Error(mensaje);
      }

      toast({
        title: "¡Registro Exitoso!",
        description: "El empleado ha sido registrado y su usuario creado.",
      });
      
      router.push("/dashboard/propietario/personal");

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Registrar Personal" menuItems={menuItems}>
      <div className="space-y-6">
        
        <div className="flex justify-between">
            <Link href="/dashboard/propietario/personal">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Volver a la lista
              </Button>
            </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo Colaborador</CardTitle>
            <CardDescription>
                Registra un nuevo empleado. Se generará automáticamente un usuario para que pueda acceder a la aplicación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input 
                    id="nombre" 
                    name="nombre" 
                    placeholder="Ej: Carlos Pérez" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono (WhatsApp) *</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                        id="telefono" 
                        name="telefono" 
                        placeholder="50588888888" 
                        className="pl-8"
                        value={formData.telefono} 
                        onChange={handleChange} 
                        required 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Este será su medio de acceso y contacto.</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="puesto">Puesto / Rol *</Label>
                  <Select 
                    value={formData.puesto} 
                    onValueChange={(value) => handleSelectChange("puesto", value)}
                  >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona un puesto" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Asistente">Asistente (Acceso a App)</SelectItem>
                        <SelectItem value="Chofer">Chofer</SelectItem>
                        <SelectItem value="Administrativo">Administrativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salario">Salario Mensual (C$)</Label>
                  <Input 
                    id="salario" 
                    name="salario" 
                    type="number" 
                    placeholder="0.00" 
                    value={formData.salario} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                 <div className="space-y-2">
                    <Label htmlFor="fechaContratacion">Fecha de Contratación</Label>
                    <div className="relative">
                        <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input 
                            id="fechaContratacion" 
                            name="fechaContratacion" 
                            type="date" 
                            className="pl-8"
                            value={formData.fechaContratacion} 
                            onChange={handleChange} 
                        />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label htmlFor="vehiculoId">Vehículo Asignado (Opcional)</Label>
                    <Select 
                        value={formData.vehiculoId} 
                        onValueChange={(value) => handleSelectChange("vehiculoId", value)}
                        disabled={vehiculosLoading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={vehiculosLoading ? "Cargando..." : "Seleccionar vehículo"} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="N/A">Ninguno / No Asignado</SelectItem>
                            {vehiculos.map(v => (
                                <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link href="/dashboard/propietario/personal">
                    <Button type="button" variant="outline" disabled={loading}>Cancelar</Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Guardar Personal
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}