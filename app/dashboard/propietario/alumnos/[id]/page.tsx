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
// Quitamos el Checkbox
// import { Checkbox } from "@/components/ui/checkbox";

// --- DEFINICIÓN DEL TIPO ALUMNO (DESDE LA BD) ---
export type Alumno = {
  id: string;
  nombre: string;
  tutor: string;
  grado: string;
  contacto: string;
  activo: boolean;
  precio?: number;
  direccion: string;
  recorridoId: string;
};

// --- DEFINICIÓN DEL MENÚ (Omitido por brevedad, el tuyo está bien) ---
const menuItems: MenuItem[] = [/* ... tu menú ... */];


export default function EditarAlumnoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Estado del formulario: Ya no incluye 'activo'
  const [formData, setFormData] = useState<Partial<Alumno>>({
    nombre: "",
    tutor: "",
    grado: "",
    contacto: "",
    direccion: "",
    recorridoId: "",
    precio: 0,
  });

  // --- OBTENER DATOS DEL ALUMNO A EDITAR ---
  useEffect(() => {
    if (!id) return;

    const fetchAlumno = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos/${id}`);
        if (!response.ok) {
          throw new Error("No se pudo encontrar el alumno");
        }
        const data: Alumno = await response.json();
        setFormData(data);
      } catch (err: any) {
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
    fetchAlumno();
  }, [id, router, toast]);

  // --- MANEJADORES DE FORMULARIO ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Ya no necesitamos 'handleCheckboxChange'

  // --- ACTUALIZAR EN LA API ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      
      // ===== ¡AQUÍ ESTÁ LA CORRECCIÓN! =====
      // Creamos el 'payload' (cuerpo) manualmente solo con los campos
      // que nuestro DTO de actualización (UpdateAlumnoDto) permite.
      // Excluimos 'id', 'deletedAt', 'activo', etc.
      const payload = {
        nombre: formData.nombre,
        tutor: formData.tutor,
        grado: formData.grado,
        contacto: formData.contacto,
        direccion: formData.direccion,
        recorridoId: formData.recorridoId,
        precio: Number(formData.precio),
      };
      // ======================================
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), // Enviamos el payload limpio
      });

      if (!response.ok) {
        // Si la API responde con un 400 (error de validación)
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
          <p>Cargando datos del alumno...</p>
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
                  <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutor">Nombre del Tutor *</Label>
                  <Input id="tutor" name="tutor" value={formData.tutor} onChange={handleChange} required />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion">Dirección *</Label>
                  <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grado">Grado *</Label>
                  <Select value={formData.grado} onValueChange={(value) => handleSelectChange("grado", value)}>
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
                  <Input id="contacto" name="contacto" type="tel" value={formData.contacto} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Asignar Recorrido *</Label>
                <Select
                  value={formData.recorridoId}
                  onValueChange={(value) => handleSelectChange("recorridoId", value)}
                  required
                >
                  <SelectTrigger><SelectValue placeholder="Selecciona un recorrido" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recorridoA">Recorrido A</SelectItem>
                    <SelectItem value="recorridoB">Recorrido B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio">Precio Mensual</Label>
                <Input id="precio" name="precio" type="number" value={formData.precio ?? 0} onChange={handleChange} />
              </div>

              {/* --- CHECKBOX ELIMINADO --- */}

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