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
import type { Gasto } from "../page"; // Importamos el tipo Gasto

// --- NUEVOS TIPOS CARGADOS ---
type Vehiculo = {
  id: string;
  nombre: string;
};
type Personal = {
  id: string;
  nombre: string;
  salario: number;
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

  // --- Cargar datos del gasto Y ADEMÁS vehículos y personal ---
  useEffect(() => {
    if (!id) return;

    const fetchDatos = async () => {
      try {
        const [gastoRes, vehiculosRes, personalRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/gastos/${id}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos?estado=activo`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/personal?estado=activo`)
        ]);

        if (!gastoRes.ok) throw new Error("No se pudo encontrar el gasto");
        if (!vehiculosRes.ok) throw new Error("No se pudieron cargar los vehículos");
        if (!personalRes.ok) throw new Error("No se pudo cargar la lista de personal");
        
        const data: Gasto = await gastoRes.json();
        const dataVehiculos: Vehiculo[] = await vehiculosRes.json();
        const dataPersonal: Personal[] = await personalRes.json();
        
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
        toast({ title: "Error al cargar", description: (err as Error).message, variant: "destructive" });
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
    // Caso especial: si cambian la categoría a 'salarios'
    if (name === "categoria" && value === "salarios") {
      setFormData(prev => ({ 
        ...prev, 
        categoria: value, 
        descripcion: "Pago de salario: ",
        vehiculoId: "N/A",
      }));
    } 
    // Caso especial: si eligen un empleado
    else if (name === "personalId" && formData.categoria === "salarios") {
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
      // Caso normal
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // --- Enviar actualización a la API ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const esSalario = formData.categoria === 'salarios';
    const esSalarioManual = esSalario && formData.personalId === "N/A";

    const payload = {
      descripcion: formData.descripcion,
      categoria: formData.categoria,
      monto: Number(formData.monto) || undefined, 
      fecha: formData.fecha,
      vehiculoId: formData.vehiculoId === "N/A" ? null : formData.vehiculoId,
      personalId: formData.personalId === "N/A" ? null : formData.personalId,
    };
    
    if (esSalario && !payload.personalId) {
        toast({ title: "Error de validación", description: "Por favor, selecciona un empleado o 'N/A (Registrar salario manual)'.", variant: "destructive" });
        setLoading(false);
        return;
    }
    
    if ((!esSalario || esSalarioManual) && (!payload.monto || payload.monto <= 0)) {
       toast({ title: "Error de validación", description: "El monto es obligatorio y debe ser mayor a cero.", variant: "destructive" });
       setLoading(false);
       return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gastos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "No se pudo actualizar el gasto");
      }

      toast({ title: "¡Actualizado!", description: "El gasto se ha guardado correctamente." });
      router.push("/dashboard/propietario/gastos");

    } catch (err: any) {
      toast({ title: "Error al guardar", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout title="Editar Gasto" menuItems={menuItems}>
        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
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
                  disabled={esSalario && !esSalarioManual} // Deshabilitado si es salario automático
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select 
                    name="categoria" 
                    value={formData.categoria || ''} 
                    onValueChange={(value) => handleSelectChange("categoria", value)}
                    required
                  >
                    <SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
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
                    name="vehiculoId"
                    value={formData.vehiculoId || 'N/A'} 
                    onValueChange={(value) => handleSelectChange("vehiculoId", value)}
                    disabled={esSalario}
                  >
                    <SelectTrigger><SelectValue placeholder="Asignar a un vehículo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/A">N/A (Gasto General)</SelectItem>
                      {/* --- ARREGLADO --- */}
                      {/* {vehiculos.length === 0 && <SelectItem value="" disabled>Cargando...</SelectItem>} */}
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

              {/* --- BLOQUE CONDICIONAL PARA SALARIOS (SIN CUADRO) --- */}
              {esSalario && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="personalId">Asignar Empleado *</Label>
                  <Select 
                    name="personalId" 
                    value={formData.personalId || "N/A"} 
                    onValueChange={(value) => handleSelectChange("personalId", value)}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecciona un empleado" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/A">N/A (Registrar salario manual)</SelectItem>
                      {/* --- ARREGLADO --- */}
                      {/* {personal.length === 0 && <SelectItem value="" disabled>Cargando personal...</SelectItem>} */}
                      {personal.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.nombre} (Salario: C${formatCurrency(p.salario || 0)})</SelectItem>
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
                    disabled={esSalario && !esSalarioManual} // Deshabilitado si es salario automático
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
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Link href="/dashboard/propietario/gastos">
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