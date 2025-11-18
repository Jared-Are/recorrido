"use client"

import { useState, useEffect } from "react"
import { AsistenteLayout } from "@/components/asistente-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Bell,
  ArrowRight,
  Car,
  Users,
  UserCheck,
  UserX,
  Loader2, // Icono de carga
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

// --- Tipos para los datos del backend ---
type Aviso = {
  id: string;
  titulo: string;
};

type ResumenStats = {
  vehiculo: { placa: string, choferNombre: string };
  totalAlumnos: number;
  presentesHoy: number;
  ausentesHoy: number;
};

type ResumenDia = {
  stats: ResumenStats;
  avisos: Aviso[];
  esDiaLectivo: boolean;
  motivoNoLectivo: string | null; // Ej: "Fin de semana", "Vacaciones"
  asistenciaRegistrada: boolean;
};

export default function AsistenteDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState<ResumenDia | null>(null);

  // --- 1. Cargar el resumen del día al montar ---
  useEffect(() => {
    const fetchResumen = async () => {
      setLoading(true);
      try {
        // Un solo endpoint que trae toda la lógica de negocio
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/asistencia/resumen-hoy`);
        if (!response.ok) throw new Error("No se pudo cargar el resumen");
        
        const data: ResumenDia = await response.json();
        setResumen(data);
        
      } catch (err: any) {
        toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchResumen();
  }, [toast]);

  const todayFormatted = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // --- 2. Lógica de la tarjeta de asistencia ---
  let cardDescription: string;
  let botonAsistenciaDeshabilitado = true;

  if (loading) {
    cardDescription = "Cargando estado del día...";
  } else if (!resumen) {
    cardDescription = "No se pudo cargar la información.";
  } else if (!resumen.esDiaLectivo) {
    // Lógica de "No hay clases" (fines de semana, vacaciones, avisos)
    cardDescription = `Hoy no hay recorrido: ${resumen.motivoNoLectivo || 'Día no lectivo'}.`;
  } else if (resumen.asistenciaRegistrada) {
    cardDescription = "La asistencia del día de hoy ya fue registrada. ¡Gracias!";
  } else {
    // Si es día lectivo y no se ha registrado
    cardDescription = "Listo para iniciar el recorrido. Registra la asistencia.";
    botonAsistenciaDeshabilitado = false;
  }

  // --- 3. Renderizado (UI sin cambios) ---
  if (loading || !resumen) {
    return (
      <AsistenteLayout title="Panel del Asistente">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </AsistenteLayout>
    );
  }

  const quickStats = [
    { label: "Vehículo Asignado", value: resumen.stats.vehiculo.placa, change: resumen.stats.vehiculo.choferNombre, icon: Car },
    { label: "Total de Alumnos", value: resumen.stats.totalAlumnos.toString(), change: "En esta ruta", icon: Users },
    { label: "Presentes Hoy", value: resumen.stats.presentesHoy.toString(), change: "Alumnos a bordo", icon: UserCheck },
    { label: "Ausentes Hoy", value: resumen.stats.ausentesHoy.toString(), change: "Marcados ausentes", icon: UserX },
  ];

  return (
    <AsistenteLayout title="Panel del Asistente">
      {/* Encabezado principal */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Resumen del Día</h1>

{/* --- INICIO DE LA CORRECCIÓN --- */}
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
        {/* --- FIN DE LA CORRECCIÓN --- */}
      </div>

      {/* Tarjeta del día */}
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{todayFormatted}</CardTitle>
          <CardDescription>
            {cardDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/dashboard/asistente/asistencia">
            <Button disabled={botonAsistenciaDeshabilitado}>
              Registrar Asistencia del Día
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2 flex items-center gap-2">
              <stat.icon className="h-4 w-4" />
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AsistenteLayout>
  )
}