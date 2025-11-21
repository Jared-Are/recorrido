"use client"

import { useState, useEffect } from "react"
import { TutorLayout } from "@/components/tutor-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, AlertCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

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
  const [error, setError] = useState<string | null>(null)
  const [hijosData, setHijosData] = useState<HijoConAsistencias[]>([])

  useEffect(() => {
    const fetchAsistencias = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) throw new Error("Sesión no válida.")

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tutor/asistencias`, { headers })

        // Manejo de tablas vacías
        if (!response.ok) {
          if (response.status === 404 || response.status === 204) {
            setHijosData([])
            return
          }
          
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Error al cargar asistencias (${response.status})`)
        }

        const data = await response.json()
        setHijosData(data)

      } catch (err: any) {
        console.error("Error al cargar asistencias del tutor:", err)
        setError(err.message)
        toast({ title: "Error", description: err.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchAsistencias()
  }, [toast])

  // --- MANEJO DE ESTADOS DE CARGA/ERROR ---
  if (loading) {
    return (
      <TutorLayout title="Registro de Asistencias">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="ml-3 text-muted-foreground">Cargando asistencias...</p>
        </div>
      </TutorLayout>
    )
  }

  if (error && hijosData.length === 0) {
    return (
      <TutorLayout title="Registro de Asistencias">
        <div className="flex flex-col justify-center items-center h-64 text-center p-6 bg-red-50 rounded-lg border border-red-100">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-bold text-red-700 mb-2">Error al cargar datos</h3>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Intentar de nuevo
          </Button>
        </div>
      </TutorLayout>
    )
  }

  // Si no hay hijos (o datos vacíos)
  if (hijosData.length === 0) {
    return (
      <TutorLayout title="Registro de Asistencias">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle>Sin Alumnos Vinculados</CardTitle>
            <CardDescription>
              Tu cuenta aún no está asociada a ningún estudiante.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Por favor, contacta al administrador de Recorrido Escolar para que te vinculen con tus hijos.</p>
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
                        <p className="text-xs mt-1">Los registros aparecerán cuando el asistente tome la asistencia diaria.</p>
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