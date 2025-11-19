"use client"

import { useState, useEffect } from "react"
import { TutorLayout } from "@/components/tutor-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// --- TIPOS ---
type RegistroAsistencia = {
  id: string;
  fecha: string;
  estado: 'presente' | 'ausente';
  fechaCreacion: string;
}

type HijoConAsistencias = {
  id: string;
  nombre: string;
  grado: string;
  registros: RegistroAsistencia[];
}

export default function AsistenciasTutorPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [hijosData, setHijosData] = useState<HijoConAsistencias[]>([])

  useEffect(() => {
    const fetchAsistencias = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tutor/asistencias`)
        if (!res.ok) throw new Error("Error al cargar asistencias")
        
        const data = await res.json()
        setHijosData(data)

      } catch (error) {
        toast({ title: "Error", description: "No se pudo cargar el historial.", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchAsistencias()
  }, [toast])

  if (loading) {
    return (
        <TutorLayout title="Registro de Asistencias">
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        </TutorLayout>
    )
  }

  // Si no hay hijos (o datos vacíos)
  if (hijosData.length === 0) {
    return (
        <TutorLayout title="Registro de Asistencias">
             <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                    No se encontraron estudiantes vinculados a tu cuenta.
                </CardContent>
             </Card>
        </TutorLayout>
    )
  }

  // Seleccionar el primer hijo por defecto
  const defaultTab = hijosData[0].id

  return (
    <TutorLayout title="Registro de Asistencias">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Asistencia por Alumno</CardTitle>
            <CardDescription>Selecciona un hijo para ver su historial de asistencia.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="space-y-4">
              
              {/* Lista de Pestañas (Hijos) */}
              <TabsList className="w-full justify-start overflow-x-auto">
                {hijosData.map(hijo => (
                  <TabsTrigger key={hijo.id} value={hijo.id}>{hijo.nombre}</TabsTrigger>
                ))}
              </TabsList>

              {/* Contenido de cada Pestaña */}
              {hijosData.map(hijo => (
                <TabsContent key={hijo.id} value={hijo.id}>
                  <div className="space-y-3">
                    {hijo.registros && hijo.registros.length > 0 ? (
                      hijo.registros.map(asistencia => (
                        <div key={asistencia.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-3">
                            {asistencia.estado === 'presente' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            
                            <div className="font-medium text-sm">
                                {/* Mostramos la fecha con formato legible */}
                                {new Date(asistencia.fecha + "T00:00:00").toLocaleDateString("es-MX", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                })}
                                <p className="text-xs text-muted-foreground capitalize">
                                   {/* Hora de registro (opcional) */}
                                   {new Date(asistencia.fechaCreacion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                          </div>

                          <Badge variant={asistencia.estado === 'presente' ? "default" : "destructive"}>
                            {asistencia.estado === 'presente' ? "Presente" : "Ausente"}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm">No hay registros de asistencia para {hijo.nombre}.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </TutorLayout>
  )
}