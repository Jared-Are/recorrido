"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockAsistencias } from "@/lib/mock-data";
import { ArrowLeft, CheckCircle, XCircle, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// El componente Collapsible ha sido reemplazado por lógica local
// para solucionar el error de importación.

export default function HistorialPage() {
  const [selectedMonth, setSelectedMonth] = useState("2025-01"); // Formato YYYY-MM
  const [openDay, setOpenDay] = useState<string | null>(null); // Estado para controlar el acordeón

  // Filtrar asistencias por el mes seleccionado
  const asistenciasDelMes = mockAsistencias.filter(a => a.fecha.startsWith(selectedMonth));

  // Agrupar asistencias por día
  const asistenciasPorDia = asistenciasDelMes.reduce((acc, asistencia) => {
    const dia = asistencia.fecha;
    if (!acc[dia]) {
      acc[dia] = [];
    }
    acc[dia].push(asistencia);
    return acc;
  }, {} as Record<string, typeof mockAsistencias>);

  const diasDelMes = Object.keys(asistenciasPorDia).sort();

  const toggleDay = (dia: string) => {
    setOpenDay(openDay === dia ? null : dia);
  };

  return (
    <DashboardLayout title="Historial de Asistencia">
      <div className="space-y-4">
        <Link href="/dashboard/asistente">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Resumen
          </Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Consultar Historial</CardTitle>
            <CardDescription>Selecciona un mes para ver el registro de asistencias.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select onValueChange={setSelectedMonth} defaultValue={selectedMonth}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Selecciona un mes" />
              </SelectTrigger>
              <SelectContent>
                {/* En una app real, esto se generaría dinámicamente */}
                <SelectItem value="2025-01">Enero 2025</SelectItem>
                <SelectItem value="2025-02">Febrero 2025</SelectItem>
                <SelectItem value="2024-12">Diciembre 2024</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-y-3">
              {diasDelMes.length > 0 ? diasDelMes.map(dia => {
                const registros = asistenciasPorDia[dia];
                const presentes = registros.filter(r => r.presente).length;
                const ausentes = registros.length - presentes;
                const ausentesNombres = registros.filter(r => !r.presente).map(r => r.alumnoNombre);

                return (
                  <div key={dia} className="border rounded-lg p-4">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="font-semibold">
                        {new Date(dia + "T00:00:00").toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4"/> {presentes} Presentes
                        </div>
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4"/> {ausentes} Ausentes
                        </div>
                        <Button variant="ghost" size="sm" className="w-9 p-0" onClick={() => toggleDay(dia)}>
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                        </Button>
                      </div>
                    </div>
                    {openDay === dia && (
                       <div className="mt-4 pt-4 border-t">
                         <p className="text-sm font-semibold mb-2">Alumnos ausentes:</p>
                         {ausentes > 0 ? (
                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                              {ausentesNombres.map(nombre => <li key={nombre}>{nombre}</li>)}
                            </ul>
                         ) : <p className="text-sm text-muted-foreground">Asistencia perfecta.</p>}
                       </div>
                    )}
                  </div>
                );
              }) : (
                <p className="text-center text-muted-foreground py-8">No hay registros para el mes seleccionado.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

