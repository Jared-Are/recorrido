"use client"

import { useState, useEffect } from "react"
import { TutorLayout } from "@/components/tutor-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react" // Bell eliminado de aquí, no se usa en la tarjeta
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type Aviso = {
  id: string;
  titulo: string;
  contenido: string; 
  destinatario: 'todos' | 'tutores' | 'personal'; 
  fechaCreacion: string; 
};

export default function AvisosTutorPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAvisos = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avisos/para-tutor`);
        
        if (!response.ok) throw new Error("Error al cargar avisos");
        
        const data: Aviso[] = await response.json();
        setAvisos(data);
      } catch (err: any) {
        toast({ title: "Error", description: "No se pudieron cargar los avisos.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchAvisos();
  }, [toast]);

  return (
    <TutorLayout title="Avisos y Comunicados">
      <div className="space-y-6">
        {/* Botón Volver */}
        <Link href="/dashboard/tutor">
           <Button variant="ghost" size="sm" className="pl-0">
             <ArrowLeft className="h-4 w-4 mr-2" />
             Volver al Inicio
           </Button>
        </Link>

        {/* Estado de Carga */}
        {loading && (
          <Card>
             <CardContent className="pt-6">
               <div className="flex justify-center py-10">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
               </div>
             </CardContent>
          </Card>
        )}

        {/* Estado Vacío */}
        {!loading && avisos.length === 0 && (
          <Card>
             <CardContent className="pt-6">
               <div className="text-center py-10 text-muted-foreground">
                  No hay avisos recientes.
               </div>
             </CardContent>
          </Card>
        )}

        {/* Lista de Avisos (Estilo Asistente) */}
        {!loading && avisos.length > 0 && (
          <div className="grid gap-4">
            {avisos.map((aviso) => (
              <Card key={aviso.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{aviso.titulo}</CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(aviso.fechaCreacion).toLocaleDateString("es-NI", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </CardDescription>
                    </div>
                    {/* Etiqueta de Destinatario (Opcional, para consistencia) */}
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">
                       Para: {aviso.destinatario?.toUpperCase() || "TODOS"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground whitespace-pre-line">
                    {aviso.contenido}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TutorLayout>
  )
}