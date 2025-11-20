"use client"

import { useState, useEffect } from "react"
import { AsistenteLayout } from "@/components/asistente-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase" // <--- IMPORTANTE

// (Este tipo 'Aviso' debe coincidir con el de tu Propietario)
export type Aviso = {
  id: string;
  titulo: string;
  contenido: string; 
  destinatario: 'todos' | 'tutores' | 'personal'; 
  fechaCreacion: string; 
};

export default function AvisosAsistentePage() {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAvisos = async () => {
      setLoading(true);
      try {
        // A. OBTENER TOKEN
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        // B. ENVIAR TOKEN EN HEADERS
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avisos/para-asistente`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
          throw new Error("No se pudo obtener la lista de avisos");
        }
        
        const data: Aviso[] = await response.json();
        setAvisos(data);

      } catch (err: any) {
        toast({
          title: "Error al cargar avisos",
          description: (err as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAvisos();
  }, [toast]);

  return (
    <AsistenteLayout title="Avisos Importantes">
      <div className="space-y-6">
        {/* 2. Botón para volver al dashboard */}
        <div>
          <Link href="/dashboard/asistente">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Resumen
            </Button>
          </Link>
        </div>

        {/* Estados de Carga y Vacío */}
        {loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-3 text-muted-foreground">Cargando avisos...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && avisos.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <p className="text-muted-foreground">No hay avisos nuevos para mostrar.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3. Lista de Avisos (Solo lectura) */}
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
    </AsistenteLayout>
  )
}