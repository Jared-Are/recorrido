"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Send, Calendar, Users } from "lucide-react"
import { mockAlumnos, mockAsistencias, type Asistencia } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

export default function AsistenteDashboard() {
  const { toast } = useToast()
  const [asistencias, setAsistencias] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    mockAlumnos.forEach((alumno) => {
      const asistenciaHoy = mockAsistencias.find(
        (a) => a.alumnoId === alumno.id && a.fecha === new Date().toISOString().split("T")[0],
      )
      initial[alumno.id] = asistenciaHoy?.presente || false
    })
    return initial
  })
  const [notificacion, setNotificacion] = useState("")
  const [historial] = useState<Asistencia[]>(mockAsistencias)

  const handleToggleAsistencia = (alumnoId: string) => {
    setAsistencias({
      ...asistencias,
      [alumnoId]: !asistencias[alumnoId],
    })
  }

  const handleGuardarAsistencia = () => {
    const presentes = Object.values(asistencias).filter(Boolean).length
    const total = mockAlumnos.length

    toast({
      title: "Asistencia guardada",
      description: `Se registró la asistencia de ${presentes} de ${total} alumnos.`,
    })
  }

  const handleEnviarNotificacion = () => {
    if (!notificacion.trim()) {
      toast({
        title: "Error",
        description: "Por favor escribe un mensaje.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Notificación enviada",
      description: "El mensaje ha sido enviado al propietario.",
    })

    setNotificacion("")
  }

  const presentesHoy = Object.values(asistencias).filter(Boolean).length
  const ausentesHoy = mockAlumnos.length - presentesHoy

  return (
    <DashboardLayout title="Panel de Asistente de Ruta">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Alumnos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div className="text-2xl font-bold">{mockAlumnos.length}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Presentes Hoy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{presentesHoy}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Ausentes Hoy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">{ausentesHoy}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="asistencia" className="space-y-4">
          <TabsList>
            <TabsTrigger value="asistencia">Registrar Asistencia</TabsTrigger>
            <TabsTrigger value="notificacion">Enviar Notificación</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="asistencia" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asistencia del Día</CardTitle>
                <CardDescription>
                  Marca los alumnos presentes en el recorrido de hoy -{" "}
                  {new Date().toLocaleDateString("es-MX", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {mockAlumnos.map((alumno) => (
                    <div
                      key={alumno.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`alumno-${alumno.id}`}
                          checked={asistencias[alumno.id]}
                          onCheckedChange={() => handleToggleAsistencia(alumno.id)}
                        />
                        <label htmlFor={`alumno-${alumno.id}`} className="cursor-pointer">
                          <div className="font-medium">{alumno.nombre}</div>
                          <div className="text-sm text-muted-foreground">
                            {alumno.grado} - Tutor: {alumno.tutor}
                          </div>
                        </label>
                      </div>
                      <Badge variant={asistencias[alumno.id] ? "default" : "secondary"}>
                        {asistencias[alumno.id] ? "Presente" : "Ausente"}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <Button onClick={handleGuardarAsistencia} className="w-full sm:w-auto">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Guardar Asistencia
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificacion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Notificación al Propietario</CardTitle>
                <CardDescription>Comunica incidencias o información importante</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mensaje">Mensaje</Label>
                  <Textarea
                    id="mensaje"
                    placeholder="Escribe tu mensaje aquí... (Ej: El vehículo presenta una falla menor, se requiere revisión)"
                    value={notificacion}
                    onChange={(e) => setNotificacion(e.target.value)}
                    rows={6}
                  />
                </div>

                <Button onClick={handleEnviarNotificacion} className="w-full sm:w-auto">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Notificación
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Asistencia</CardTitle>
                <CardDescription>Registro de asistencias anteriores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {historial.map((asistencia) => (
                    <div key={asistencia.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{asistencia.alumnoNombre}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(asistencia.fecha).toLocaleDateString("es-MX")}
                          {asistencia.hora && ` - ${asistencia.hora}`}
                        </div>
                      </div>
                      <Badge variant={asistencia.presente ? "default" : "secondary"}>
                        {asistencia.presente ? "Presente" : "Ausente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
