"use client";

import { useState, useEffect } from "react";
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CalendarCheck,
  Users,
  BarChart3,
  UserX,
  Car,
  UserCheck,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { mockAlumnos, mockAvisos, mockAsistencias, mockVehiculos } from "@/lib/mock-data";
import Link from "next/link";

// --- MENÚ DEL SIDEBAR ---
const menuItems: MenuItem[] = [
  {
    title: "Registrar Asistencia",
    icon: CalendarCheck,
    href: "/dashboard/asistente/asistencia",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "Historial",
    icon: BarChart3,
    href: "/dashboard/asistente/historial",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
];

export default function AsistenteDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [avisos] = useState(mockAvisos.filter((a) => a.destinatarios.includes("personal")));
  const [isWeekend, setIsWeekend] = useState(false);

  // --- DATOS DEL DÍA ---
  const [asistenciasHoy] = useState(() => {
    const todayISO = new Date().toISOString().split("T")[0];
    return mockAsistencias.filter((a) => a.fecha === todayISO);
  });

  const totalAlumnos = mockAlumnos.length;
  const ausentesHoy = asistenciasHoy.filter((a) => !a.presente).length;
  const presentesHoy = totalAlumnos - ausentesHoy;
  const vehiculoAsignado = mockVehiculos[0];

  useEffect(() => {
    const today = new Date().getDay();
    if (today === 0 || today === 6) setIsWeekend(true);
  }, []);

  const todayFormatted = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardLayout title="Panel del Asistente" menuItems={menuItems}>
      <div className="space-y-6">
        {/* ENCABEZADO CON MODO OSCURO Y NOTIFICACIONES */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Resumen del Día</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-6 w-6" />
              {avisos.length > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {avisos.length}
                </span>
              )}
            </Button>
            <Button variant="outline" size="sm" className="ml-2">
              <LogOut className="h-4 w-4 mr-1" /> Cerrar sesión
            </Button>
          </div>
        </div>

        {/* TARJETA PRINCIPAL */}
        <Card>
          <CardHeader>
            <CardTitle className="capitalize">{todayFormatted}</CardTitle>
            <CardDescription>
              {isWeekend
                ? "Hoy es fin de semana, no hay recorrido programado."
                : "Listo para iniciar el recorrido. Por favor, registra la asistencia."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/asistente/asistencia">
              <Button disabled={isWeekend}>
                Registrar Asistencia del Día
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* TARJETAS DE RESUMEN */}
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
              <p className="text-xs text-muted-foreground">
                {vehiculoAsignado.choferNombre}
              </p>
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
              <p className="text-xs text-muted-foreground">
                Alumnos marcados ausentes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
