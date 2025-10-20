// /lib/menu-asistente.ts
import { CalendarCheck, BarChart3, Users } from "lucide-react";

export const menuAsistente = [
  {
    title: "Registrar Asistencia",
    icon: CalendarCheck,
    href: "/dashboard/asistente/asistencia",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "Historial de Asistencias",
    icon: BarChart3,
    href: "/dashboard/asistente/historial",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    title: "Alumnos Registrados",
    icon: Users,
    href: "/dashboard/asistente/alumnos",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
];
