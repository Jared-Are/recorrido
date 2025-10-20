"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { mockAsistencias, mockAlumnos } from "@/lib/mock-data";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// --- DATOS DEL TUTOR Y SUS HIJOS ---
const tutorData = {
  hijos: mockAlumnos.filter(a => a.tutor === "María Pérez"),
};

export default function AsistenciasPage() {
  const hijosConAsistencia = tutorData.hijos.map(hijo => ({
    ...hijo,
    registros: mockAsistencias.filter(a => a.alumnoId === hijo.id)
  }));

  // Seleccionar al primer hijo por defecto
  const defaultTab = hijosConAsistencia.length > 0 ? hijosConAsistencia[0].id : "";

  return (
    <DashboardLayout title="Registro de Asistencias">
      <div className="space-y-6">
        <Link href="/dashboard/tutor">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Resumen
          </Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Asistencia por Alumno</CardTitle>
            <CardDescription>Selecciona un hijo para ver su historial de asistencia.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="space-y-4">
              <TabsList>
                {hijosConAsistencia.map(hijo => (
                  <TabsTrigger key={hijo.id} value={hijo.id}>{hijo.nombre}</TabsTrigger>
                ))}
              </TabsList>
              {hijosConAsistencia.map(hijo => (
                <TabsContent key={hijo.id} value={hijo.id}>
                  <div className="space-y-3">
                    {hijo.registros.length > 0 ? (
                      hijo.registros.map(asistencia => (
                        <div key={asistencia.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {asistencia.presente ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <div className="font-medium text-sm">
                              {new Date(asistencia.fecha + 'T00:00:00').toLocaleDateString("es-MX", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                              })}
                            </div>
                          </div>
                          <Badge variant={asistencia.presente ? "default" : "secondary"}>
                            {asistencia.presente ? "Presente" : "Ausente"}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay registros de asistencia para {hijo.nombre}.
                      </p>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

