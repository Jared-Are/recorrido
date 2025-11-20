"use client"

import { useState, useEffect } from "react"
import { AsistenteLayout } from "@/components/asistente-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, ArrowRight, Car, Users, UserCheck, UserX, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase" // <--- IMPORTANTE
import Link from "next/link"

type Aviso = { id: string; titulo: string; };
type ResumenStats = {
  vehiculo: { 
    placa: string; 
    choferNombre: string; 
    fotoUrl?: string; 
  };
  totalAlumnos: number;
  presentesHoy: number;
  ausentesHoy: number;
};
type ResumenDia = {
  stats: ResumenStats;
  avisos: Aviso[];
  esDiaLectivo: boolean;
  motivoNoLectivo: string | null;
  asistenciaRegistrada: boolean;
};

export default function AsistenteDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState<ResumenDia | null>(null);

  useEffect(() => {
    const fetchResumen = async () => {
      setLoading(true);
      try {
        // 1. OBTENER EL TOKEN DE SESIÓN
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
            // Si no hay token, redirigir al login (opcional, o dejar que falle)
            throw new Error("No hay sesión activa");
        }

        // 2. ENVIARLO EN LOS HEADERS
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/asistencia/resumen-hoy`, {
          headers: {
            'Authorization': `Bearer ${token}`, // <--- CLAVE DE ACCESO
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error("No se pudo cargar el resumen");
        const data = await response.json();
        setResumen(data);
      } catch (err: any) {
        console.error(err);
        toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchResumen();
  }, [toast]);

  const todayFormatted = new Date().toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  if (loading) {
    return (
      <AsistenteLayout title="Panel del Asistente">
        <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 animate-spin text-muted-foreground" /></div>
      </AsistenteLayout>
    );
  }

  if (!resumen) return null;

  const botonAsistenciaDeshabilitado = !resumen.esDiaLectivo || resumen.asistenciaRegistrada;
  let cardDescription = "Listo para iniciar el recorrido.";
  if (!resumen.esDiaLectivo) cardDescription = `Hoy no hay recorrido: ${resumen.motivoNoLectivo}.`;
  else if (resumen.asistenciaRegistrada) cardDescription = "Asistencia ya registrada. ¡Gracias!";

  return (
    <AsistenteLayout title="Panel del Asistente">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Resumen del Día</h1>
        <Link href="/dashboard/asistente/avisos">
            <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-6 w-6" />
            {resumen.avisos.length > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {resumen.avisos.length}
                </span>
            )}
            </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="capitalize">{todayFormatted}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/asistente/asistencia">
            <Button disabled={botonAsistenciaDeshabilitado} className="w-full sm:w-auto">
              Registrar Asistencia del Día <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <Card className="overflow-hidden col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex h-full">
                <div className="p-6 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Car className="h-4 w-4" />
                        <span className="text-xs font-medium uppercase">Unidad</span>
                    </div>
                    <div className="text-2xl font-bold truncate">{resumen.stats.vehiculo.placa}</div>
                    <p className="text-xs text-muted-foreground mt-1 truncate w-full">
                        {resumen.stats.vehiculo.choferNombre}
                    </p>
                </div>
                
                <div className="w-32 h-auto bg-gray-100 dark:bg-gray-800 relative shrink-0 border-l">
                    {resumen.stats.vehiculo.fotoUrl ? (
                        <img 
                            src={resumen.stats.vehiculo.fotoUrl} 
                            alt="Vehículo" 
                            className="absolute inset-0 w-full h-full object-cover" 
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <Car className="h-8 w-8 opacity-20" />
                        </div>
                    )}
                </div>
            </div>
        </Card>

        <Card>
            <CardHeader className="pb-2 flex flex-row items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><CardDescription>Total Alumnos</CardDescription></CardHeader>
            <CardContent><div className="text-2xl font-bold">{resumen.stats.totalAlumnos}</div><p className="text-xs text-muted-foreground mt-1">En esta ruta</p></CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2 flex flex-row items-center gap-2"><UserCheck className="h-4 w-4 text-muted-foreground" /><CardDescription>Presentes Hoy</CardDescription></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{resumen.stats.presentesHoy}</div><p className="text-xs text-muted-foreground mt-1">Alumnos a bordo</p></CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2 flex flex-row items-center gap-2"><UserX className="h-4 w-4 text-muted-foreground" /><CardDescription>Ausentes Hoy</CardDescription></CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{resumen.stats.ausentesHoy}</div><p className="text-xs text-muted-foreground mt-1">Marcados ausentes</p></CardContent>
        </Card>
      </div>
    </AsistenteLayout>
  )
}