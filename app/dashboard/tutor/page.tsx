"use client"

import { useState, useEffect } from "react"
import { TutorLayout } from "@/components/tutor-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertCircle, ArrowRight, Bell, DollarSign, Loader2, Bus, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function TutorDashboard() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tutor/resumen`, { headers })

        // Manejo de tablas vacías
        if (!response.ok) {
          if (response.status === 404 || response.status === 204) {
            setData({ hijos: [], avisos: [], pagos: { estado: 'al_dia', montoPendiente: 0 } })
            return
          }
          
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Error al cargar datos (${response.status})`)
        }

        const json = await response.json()
        setData(json)
      } catch (err: any) {
        console.error("Error al cargar resumen del tutor:", err)
        setError(err.message)
        toast({ title: "Error", description: err.message, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  if (loading) {
    return (
      <TutorLayout title="Inicio">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </TutorLayout>
    )
  }

  // Si hay un error de conexión grave (no 404 de datos)
  if (error && data?.hijos?.length === 0) {
    return (
      <TutorLayout title="Inicio">
        <div className="flex flex-col justify-center items-center h-64 text-center p-6 bg-red-50 rounded-lg border border-red-100">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-bold text-red-700 mb-2">No se pudieron cargar tus datos</h3>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Recargar
          </Button>
        </div>
      </TutorLayout>
    )
  }

  if (!data || data.hijos.length === 0) {
    return (
      <TutorLayout title="Inicio">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle>Sin Alumnos Vinculados</CardTitle>
            <CardDescription>
              Tu cuenta aún no está asociada a ningún estudiante.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Por favor, contacta al administrador de Recorrido Escolar para que te vinculen con tus hijos.</p>
            <Link href="/dashboard/tutor/avisos">
              <Button size="sm" variant="outline" className="mt-4">Ver Comunicados (Avisos)</Button>
            </Link>
          </CardContent>
        </Card>
      </TutorLayout>
    )
  }

  return (
    <TutorLayout title="Inicio">
      <div className="space-y-6 pb-20">
        
        {/* --- HEADER CON CAMPANITA IDÉNTICA AL ASISTENTE --- */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Resumen Familiar</h1>
          <Link href="/dashboard/tutor/avisos">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-6 w-6" />
              {data.avisos && data.avisos.length > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {data.avisos.length}
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* --- TARJETAS DE HIJOS (ESTILO ORIGINAL) --- */}
        {data.hijos.map((hijo: any) => (
          <Card key={hijo.id} className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Estado de hoy</CardDescription>
              <CardTitle className="text-2xl">{hijo.nombre}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mt-2">
                
                {/* --- FOTO DE LA UNIDAD (ESTILO ORIGINAL) --- */}
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-md overflow-hidden border bg-gray-50 shrink-0 relative">
                  {hijo.vehiculoFotoUrl ? (
                    <img src={hijo.vehiculoFotoUrl} alt="Bus" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      <Bus className="h-8 w-8 opacity-20" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  {hijo.estadoHoy === 'presente' && (
                    <>
                      <div className="bg-green-100 p-2 sm:p-3 rounded-full shrink-0">
                        <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-base sm:text-lg text-green-700">A bordo</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Registrado: {hijo.horaRecogida ? new Date(hijo.horaRecogida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </p>
                      </div>
                    </>
                  )}
                  {hijo.estadoHoy === 'ausente' && (
                    <>
                      <div className="bg-red-100 p-2 sm:p-3 rounded-full shrink-0">
                        <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                      </div>
                      <div>
                        <p className="font-bold text-base sm:text-lg text-red-700">Ausente</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">No asiste hoy.</p>
                      </div>
                    </>
                  )}
                  {hijo.estadoHoy === 'pendiente' && (
                    <>
                      <div className="bg-yellow-100 p-2 sm:p-3 rounded-full shrink-0">
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-bold text-base sm:text-lg text-yellow-700">Esperando</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Sin registro aún.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* --- TARJETA DE PAGOS (ESTILO ORIGINAL) --- */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Pagos</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="text-2xl font-bold">C$ {data.pagos.montoPendiente}</p>
                  <p className="text-xs text-muted-foreground">Saldo pendiente</p>
                </div>
                <Badge variant="outline">Al día</Badge>
              </div>
              <div className="mt-4">
                <Link href="/dashboard/tutor/pagos">
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                    Ver Historial <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TutorLayout>
  )
}