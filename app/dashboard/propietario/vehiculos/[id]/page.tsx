"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from '@supabase/supabase-js'; // 1. Supabase
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    Loader2,
    Upload,
    Image as ImageIcon,
    X
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// 2. Cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  const { id } = useParams(); // Obtener ID de la URL
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(""); // Estado de la foto

  const [formData, setFormData] = useState({
    nombre: "",
    placa: "",
    marca: "",
    modelo: "",
    anio: "",
    capacidad: "",
  });

  // 3. Cargar datos del vehículo al iniciar
  useEffect(() => {
    const fetchVehiculo = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos/${id}`);
            if (!res.ok) throw new Error("Error al cargar vehículo");
            const data = await res.json();
            
            setFormData({
                nombre: data.nombre,
                placa: data.placa,
                marca: data.marca,
                modelo: data.modelo,
                anio: data.anio,
                capacidad: data.capacidad
            });
            
            // Si ya tenía foto, la cargamos
            if (data.fotoUrl) setFotoUrl(data.fotoUrl);

        } catch (error) {
            toast({ title: "Error", description: "No se encontró el vehículo", variant: "destructive" });
            router.push("/dashboard/propietario/vehiculos");
        }
    };
    if (id) fetchVehiculo();
  }, [id, toast, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 4. Subida de Imagen (Misma lógica que en Crear)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vehiculos') 
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('vehiculos').getPublicUrl(filePath);
      setFotoUrl(data.publicUrl);
      toast({ title: "Imagen actualizada", description: "Recuerda guardar los cambios." });

    } catch (error: any) {
      toast({ title: "Error al subir imagen", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFotoUrl("");
  };

  // 5. Guardar Cambios (PATCH)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      anio: parseInt(formData.anio) || undefined,
      capacidad: parseInt(formData.capacidad) || undefined,
      fotoUrl: fotoUrl, // <-- Enviamos la nueva URL (o la vieja, o vacío)
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos/${id}`, {
        method: 'PATCH', // Método PATCH para editar
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("No se pudo actualizar el vehículo");

      toast({ title: "Vehículo Actualizado", description: "Los cambios se guardaron correctamente." });
      router.push("/dashboard/propietario/vehiculos");

    } catch (err: any) {
      toast({ title: "Error al guardar", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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
            <CardDescription>Modifica los detalles o la foto de la unidad.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* --- SECCIÓN FOTO --- */}
              <div className="space-y-2">
                  <Label>Fotografía de la Unidad</Label>
                  <div className="flex items-start gap-6 border p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20">
                      <div className="relative h-32 w-48 bg-white dark:bg-gray-800 rounded-md border flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                          {uploading ? (
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          ) : fotoUrl ? (
                              <>
                                <img src={fotoUrl} alt="Vista previa" className="h-full w-full object-cover" />
                                <button 
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    title="Quitar foto"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                              </>
                          ) : (
                              <div className="text-center p-2">
                                  <ImageIcon className="h-8 w-8 text-gray-300 mx-auto mb-1" />
                                  <span className="text-xs text-gray-400">Sin imagen</span>
                              </div>
                          )}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                          <p className="text-sm text-muted-foreground">
                              Cambia la foto si la unidad ha sido renovada o pintada.
                          </p>
                          <Label htmlFor="foto-upload" className="cursor-pointer inline-flex">
                              <div className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                  <Upload className="h-4 w-4" />
                                  {fotoUrl ? "Cambiar Foto" : "Subir Foto"}
                              </div>
                              <Input 
                                  id="foto-upload" 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={handleImageUpload}
                                  disabled={uploading || loading}
                              />
                          </Label>
                      </div>
                  </div>
              </div>

              {/* --- CAMPOS DE TEXTO (Con valores cargados) --- */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre o Apodo</Label>
                  <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="placa">Placa</Label>
                   <Input id="placa" name="placa" value={formData.placa} onChange={handleChange} required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                 <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Input id="marca" name="marca" value={formData.marca} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input id="modelo" name="modelo" value={formData.modelo} onChange={handleChange} />
                </div>
              </div>

               <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="anio">Año</Label>
                  <Input id="anio" name="anio" type="number" value={formData.anio} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacidad">Capacidad</Label>
                  <Input id="capacidad" name="capacidad" type="number" value={formData.capacidad} onChange={handleChange} />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading || uploading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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