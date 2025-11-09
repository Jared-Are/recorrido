"use client";

import type React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
    ArrowLeft, 
    Save, 
    Trash2, 
    Plus,
    Users, 
    DollarSign, 
    Bus, 
    UserCog, 
    Bell, 
    BarChart3, 
    TrendingDown 
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// --- DEFINICIÓN DEL MENÚ PARA QUE EL LAYOUT FUNCIONE ---
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


export default function NuevoAlumnoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    tutor: "",
    grado: "",
    contacto: "",
    direccion: "",
    recorridoId: "",
    precio: "",
    hermanos: false,
  });

  const [otrosHijos, setOtrosHijos] = useState<
    { nombre: string; grado: string }[]
  >([]);

  const agregarHijo = () => {
    setOtrosHijos([...otrosHijos, { nombre: "", grado: "" }]);
  };

  const eliminarHijo = (index: number) => {
    const nuevos = [...otrosHijos];
    nuevos.splice(index, 1);
    setOtrosHijos(nuevos);
  };

  const handleChangeHijo = (
    index: number,
    field: "nombre" | "grado",
    value: string
  ) => {
    const nuevos = [...otrosHijos];
    nuevos[index][field] = value;
    setOtrosHijos(nuevos);
  };

  // --- GUARDAR EN LA API ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const alumnosAInscribir = [
      { nombre: formData.nombre, grado: formData.grado },
      ...otrosHijos.filter((h) => h.nombre.trim() !== ""),
    ];

    try {
      const promesasDeCreacion = alumnosAInscribir.map((alumno) => {
        
        const payload = {
          nombre: alumno.nombre,
          grado: alumno.grado,
          tutor: formData.tutor,
          contacto: formData.contacto,
          direccion: formData.direccion,
          recorridoId: formData.recorridoId,
          precio: Number(formData.precio), // Convertir a número
          activo: true, // Por defecto al crear
        };

        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      });

      const responses = await Promise.all(promesasDeCreacion);

      const algunaFallo = responses.some((res) => !res.ok);
      if (algunaFallo) {
        throw new Error("Error al registrar a uno o más alumnos. Revisa que los datos no estén duplicados (ej. RUT).");
      }

      toast({
        title: "Registro Exitoso",
        description: `Se registraron ${alumnosAInscribir.length} alumno(s) correctamente.`,
      });
      
      router.push("/dashboard/propietario/alumnos");

    } catch (err: any) {
      console.error("Error en handleSubmit:", err);
      toast({
        title: "Error en el registro",
        description: err.message || "No se pudieron guardar los datos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Registrar Alumno" menuItems={menuItems}>
      <div className="space-y-6">
        
        <div className="flex justify-between">
            <Link href="/dashboard/propietario/alumnos">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la lista
              </Button>
            </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo Alumno</CardTitle>
            <CardDescription>Completa los datos del estudiante y su familia.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input id="nombre" placeholder="Ej: Juan Pérez López" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutor">Nombre del Tutor *</Label>
                  <Input id="tutor" placeholder="Ej: María Pérez" value={formData.tutor} onChange={(e) => setFormData({ ...formData, tutor: e.target.value })} required />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion">Dirección *</Label>
                  <Input id="direccion" placeholder="Ej: Calle Ficticia 123, Zona A" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grado">Grado *</Label>
                  <Select value={formData.grado} onValueChange={(value) => setFormData({ ...formData, grado: value })}>
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
                  <Input id="contacto" type="tel" placeholder="Ej: 555-0123" value={formData.contacto} onChange={(e) => setFormData({ ...formData, contacto: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Asignar Recorrido *</Label>
                <Select
                  value={formData.recorridoId}
                  onValueChange={(value) => setFormData({ ...formData, recorridoId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un recorrido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recorridoA">Recorrido A</SelectItem>
                    <SelectItem value="recorridoB">Recorrido B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio">Precio Mensual (Familia) *</Label>
                <Input id="precio" type="number" placeholder="Ej: 1500" value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} required />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  checked={formData.hermanos}
                  onCheckedChange={(checked) => {
                    setFormData({ ...formData, hermanos: checked === true });
                    if (checked) setOtrosHijos([{ nombre: "", grado: "" }]);
                    else setOtrosHijos([]);
                  }}
                  id="hermanos-check"
                />
                <Label htmlFor="hermanos-check">¿Tiene más hijos en el recorrido?</Label>
              </div>

              {formData.hermanos && (
                <div className="space-y-4 mt-4 border-t pt-4">
                  <Label>Otros hijos</Label>
                  {otrosHijos.map((hijo, index) => (
                    <div key={index} className="grid gap-2 md:grid-cols-3 items-end">
                      <div className="space-y-2">
                        <Label>Nombre del hijo {index + 2}</Label>
                        <Input placeholder={`Ej: Pedro Pérez`} value={hijo.nombre} onChange={(e) => handleChangeHijo(index, "nombre", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Grado</Label>
                        <Select value={hijo.grado} onValueChange={(value) => handleChangeHijo(index, "grado", value)}>
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
                      <Button type="button" variant="destructive" size="icon" onClick={() => eliminarHijo(index)} className="mt-6">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={agregarHijo} className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar otro hijo
                  </Button>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar Alumno(s)"}
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