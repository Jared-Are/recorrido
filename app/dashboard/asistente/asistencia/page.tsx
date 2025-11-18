"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AsistenteLayout } from "@/components/asistente-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2 } from "lucide-react";

// (El tipo AlumnoAsistencia sigue igual)
type AlumnoAsistencia = {
  id: string;
  nombre: string;
  grado: string;
  tutor: string;
};

export default function RegistrarAsistenciaPage() {
  const { toast } = useToast();
  const router = useRouter();
  
  const [alumnos, setAlumnos] = useState<AlumnoAsistencia[]>([]);
  const [ausentes, setAusentes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // (useEffect sigue igual)
  useEffect(() => {
    const fetchAlumnosDelDia = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/asistencia/alumnos-del-dia`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "No se puede registrar asistencia hoy.");
        }
        
        const data: AlumnoAsistencia[] = await response.json();
        setAlumnos(data);

      } catch (err: any) {
        toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
        router.push("/dashboard/asistente"); 
      } finally {
        setLoading(false);
      }
    };
    fetchAlumnosDelDia();
  }, [toast, router]);

  // (toggleAusente sigue igual)
  const toggleAusente = (id: string) => {
    setAusentes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // --- 2. Enviar el lote de asistencia al backend ---
  const handleGuardar = async () => {
    setSending(true);

    // ================== INICIO DE LA CORRECCIÓN ==================
    
    // 1. Este es el array que ya tenías (solo le cambié el nombre)
    const registros = alumnos.map(alumno => ({
      alumnoId: alumno.id,
      fecha: new Date().toISOString().split("T")[0],
      estado: ausentes.includes(alumno.id) ? 'ausente' : 'presente',
    }));

    // 2. Este es el payload que el backend espera
    const payload = {
      registros: registros, // <-- Envolver el array en un objeto
    };

    // =================== FIN DE LA CORRECCIÓN ====================

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/asistencia/registrar-lote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) // <-- Enviamos el objeto
      });

      if (!response.ok) {
         // Capturar el error de validación de NestJS
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message.toString() || "No se pudo guardar la asistencia.");
      }

      const presentes = alumnos.length - ausentes.length;
      toast({
        title: "Asistencia guardada",
        description: `Asistieron ${presentes} de ${alumnos.length} alumnos.`,
      });
      router.push("/dashboard/asistente");

    } catch (err: any) {
      toast({ title: "Error al guardar", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };
  
  // (El resto del return JSX sigue exactamente igual)
  if (loading) {
    return (
      <AsistenteLayout title="Registrar Asistencia">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="ml-4 text-muted-foreground">Cargando lista de alumnos...</p>
        </div>
      </AsistenteLayout>
    );
  }

  return (
    <AsistenteLayout title="Registrar Asistencia">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Lista de Asistencia del Día</CardTitle>
            <CardDescription>
              Marca solo los alumnos que <strong>no asistieron</strong> al recorrido de hoy.
            </CardDescription>
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
                    <p className="text-xs text-muted-foreground">{a.grado} - Tutor: {a.tutor}</p>
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
                    disabled={sending}
                  />
                  <Badge variant={ausentes.includes(a.id) ? "secondary" : "default"}>
                    {ausentes.includes(a.id) ? "Ausente" : "Presente"}
                  </Badge>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t">
              <Button onClick={handleGuardar} disabled={sending || loading}>
                {sending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                {sending ? "Guardando..." : "Guardar Asistencia"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AsistenteLayout>
  );
}