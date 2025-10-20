"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CalendarCheck, Users, BarChart3, ArrowRight, UserX, Car, UserCheck, Menu, X } from "lucide-react";
import { mockAlumnos, mockAvisos, mockAsistencias, mockVehiculos } from "@/lib/mock-data";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// --- MENÚ DEL SIDEBAR ---
const menuItems = [
    { title: "Registrar Asistencia", icon: CalendarCheck, href: "/dashboard/asistente/asistencia" },
    { title: "Historial", icon: BarChart3, href: "/dashboard/asistente/historial" },
];

export default function AsistenteDashboard() {
  const [avisos] = useState(mockAvisos.filter((a) => a.destinatarios.includes("personal")));
  const [isWeekend, setIsWeekend] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- LÓGICA PARA NUEVOS DASHBOARDS ---
  const [asistenciasHoy] = useState(() => {
    const todayISO = new Date().toISOString().split('T')[0]; // Formato "YYYY-MM-DD"
    return mockAsistencias.filter(a => a.fecha === todayISO);
  });
  
  const totalAlumnos = mockAlumnos.length;
  const ausentesHoy = asistenciasHoy.filter(a => !a.presente).length;
  const presentesHoy = totalAlumnos - ausentesHoy;
  const vehiculoAsignado = mockVehiculos[0]; // Simula el vehículo asignado a la ruta

  useEffect(() => {
    const today = new Date().getDay();
    if (today === 0 || today === 6) {
      setIsWeekend(true);
    }
  }, []);

  const todayFormatted = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <DashboardLayout
      title="Panel del Asistente"
      sidebar={
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-4 left-4 z-[60]"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.3, type: "tween" }}
                  className="fixed top-0 left-0 h-screen w-64 bg-card shadow-lg z-50 flex flex-col"
                >
                  <div className="flex-1 overflow-y-auto pt-20 p-2 space-y-1">
                    {menuItems.map((item) => (
                      <Link key={item.title} href={item.href} onClick={() => setSidebarOpen(false)}>
                        <div className="flex items-center p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                          <item.icon className="h-5 w-5 mr-3" />
                          <span className="font-medium text-sm">{item.title}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      }
    >
      <div className="space-y-6 pt-16 md:pt-0">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Resumen del Día</h1>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-6 w-6" />
            {avisos.length > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {avisos.length}
              </span>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="capitalize">{todayFormatted}</CardTitle>
            <CardDescription>
              {isWeekend 
                ? "Hoy es fin de semana, no hay recorrido programado."
                : "Listo para iniciar el recorrido. Por favor, registra la asistencia."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/asistente/asistencia">
              <Button disabled={isWeekend}>
                Registrar Asistencia del Día
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Vehículo Asignado
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-xl font-semibold">{vehiculoAsignado.placa}</p>
                     <p className="text-xs text-muted-foreground">{vehiculoAsignado.choferNombre}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Total de Alumnos
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{totalAlumnos}</p>
                    <p className="text-xs text-muted-foreground">En esta ruta</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Presentes Hoy
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-3xl font-bold text-green-600">{presentesHoy}</p>
                     <p className="text-xs text-muted-foreground">Alumnos a bordo</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                        <UserX className="h-4 w-4" />
                        Ausentes Hoy
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-3xl font-bold text-red-600">{ausentesHoy}</p>
                     <p className="text-xs text-muted-foreground">Alumnos marcados ausentes</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

