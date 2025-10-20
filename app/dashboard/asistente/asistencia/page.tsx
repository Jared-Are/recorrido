"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { mockAlumnos } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { menuAsistente } from "@/lib/menu-asistente"; // ✅ Importa el menú

export default function RegistrarAsistenciaPage() {
  const { toast } = useToast();
  const [alumnos] = useState(mockAlumnos);
  const [ausentes, setAusentes] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const toggleAusente = (id: string) => {
    setAusentes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleGuardar = () => {
    const presentes = alumnos.filter((a) => !ausentes.includes(a.id));
    toast({
      title: "Asistencia guardada",
      description: `Asistieron ${presentes.length} de ${alumnos.length} alumnos.`,
    });
    console.log("Notificaciones automáticas enviadas a tutores:", presentes.map(a => a.nombre));
  };
  
  const handleConfirmMarcarTodosAusentes = () => {
    setAusentes(alumnos.map(a => a.id));
    toast({
        title: "Todos los alumnos marcados como ausentes",
        description: "Se ha registrado inasistencia general por suspensión de clases.",
        variant: "destructive"
    });
    setIsConfirmOpen(false);
  };

  return (
    <DashboardLayout title="Registrar Asistencia" menuItems={menuAsistente}> {/* ✅ Props completas */}
      <div className="space-y-4">
        <Link href="/dashboard/asistente">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Resumen
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <CardTitle>Lista de Asistencia del Día</CardTitle>
                <CardDescription>
                  Marca solo los alumnos que <strong>no asistieron</strong> al recorrido de hoy.
                </CardDescription>
              </div>
              
              <Button variant="destructive" onClick={() => setIsConfirmOpen(true)}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                No hay clases hoy
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {alumnos.map((a) => (
              <div
                key={a.id}
                className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{a.nombre}</p>
                    <p className="text-xs text-muted-foreground">{a.grado} - {a.tutor}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label
                    htmlFor={`check-${a.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    ¿Ausente?
                  </label>
                  <Checkbox
                    id={`check-${a.id}`}
                    checked={ausentes.includes(a.id)}
                    onCheckedChange={() => toggleAusente(a.id)}
                  />
                  <Badge variant={ausentes.includes(a.id) ? "secondary" : "default"}>
                    {ausentes.includes(a.id) ? "Ausente" : "Presente"}
                  </Badge>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t">
              <Button onClick={handleGuardar}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Guardar Asistencia
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Confirmación Personalizado */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md m-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">¿Estás seguro?</h2>
              <p className="text-sm text-muted-foreground">
                Esta acción marcará a <strong>todos</strong> los alumnos como ausentes. 
                Úsalo solo para días festivos o suspensión de clases.
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleConfirmMarcarTodosAusentes}>
                Confirmar Inasistencia
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
