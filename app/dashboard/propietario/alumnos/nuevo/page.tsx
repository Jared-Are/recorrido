"use client";

import type React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
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
import { ArrowLeft, Save, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function NuevoAlumnoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    tutor: "",
    grado: "",
    contacto: "",
    direccion: "", // <-- Campo Dirección añadido
    servicio: "",
    recorridoId: "", // <-- CAMPO RECORRIDO AÑADIDO
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const hijosValidos = otrosHijos.filter((h) => h.nombre.trim() !== "");

    const todosLosAlumnos = [
      { nombre: formData.nombre, grado: formData.grado },
      ...hijosValidos,
    ];

    console.log("Alumnos registrados:", todosLosAlumnos);
    console.log("Tutor:", formData.tutor);
    console.log("Dirección:", formData.direccion);
    console.log("Recorrido asignado:", formData.recorridoId);
    console.log("Precio compartido:", formData.precio);

    toast({
      title: "Alumno(s) registrado(s)",
      description: `Se registraron ${todosLosAlumnos.length} alumno(s) correctamente.`,
    });

    setLoading(false);
    router.push("/dashboard/propietario/alumnos");
  };

  return (
    <DashboardLayout title="Registrar Alumno">
      <div className="space-y-6">
        <div className="flex justify-between">
            <Link href="/dashboard/propietario/alumnos">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la lista
              </Button>
            </Link>
             <Link href="/dashboard/propietario">
              <Button variant="ghost" size="sm">
                Volver al menú principal
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

              {/* --- CAMPO PARA ASIGNAR RECORRIDO --- */}
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
