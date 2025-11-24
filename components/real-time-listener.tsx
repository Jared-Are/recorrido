"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Conexión única al Backend
const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000", {
  autoConnect: false,
});

export default function RealTimeListener() {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Conectar solo si hay sesión
    const connectSocket = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && !socket.connected) {
            socket.connect();
        }
    };
    connectSocket();

    // --- ESCUCHA DE EVENTOS ---

    // 1. NUEVO PAGO (Para el Admin)
    socket.on('nuevo-pago', (data) => {
        // Aquí podrías filtrar si el usuario actual es admin
        toast({
            title: "💰 Pago Recibido",
            description: `C$ ${data.monto} - ${data.alumnoNombre}`,
            className: "border-l-4 border-green-500"
        });
        // Opcional: Recargar datos si estás en la pantalla de pagos
        router.refresh();
    });

    // 2. ASISTENCIA / MONITOR DE RUTA (Para Admin y Padres)
    socket.on('nueva-asistencia-lote', async (data) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const rol = user.user_metadata?.rol;

        // CASO A: Soy Admin -> Me interesa saber que la ruta avanza
        if (rol === 'propietario' || rol === 'admin') {
            toast({
                title: "🚌 Actividad en Ruta",
                description: `${data.asistente} registró asistencia en ${data.vehiculo}.`,
            });
        }

        // CASO B: Soy Padre -> Me interesa si MI hijo va ahí
        if (rol === 'tutor' || rol === 'padre') {
            // Buscamos si alguno de los alumnos reportados es mi hijo
            // (Esto requiere que el backend mande IDs, que ya lo hace)
            // Por simplicidad del MVP, mostramos aviso genérico o filtramos si tienes la lista de tus hijos en memoria
            toast({
                title: "🚌 Novedades de Transporte",
                description: `Se ha actualizado el estado de la ruta de ${data.vehiculo}. Revisa el estado de tu hijo.`,
            });
        }
    });

    // Limpieza al desmontar
    return () => {
        socket.off('nuevo-pago');
        socket.off('nueva-asistencia-lote');
    };
  }, [toast, router]);

  return null; // Este componente no pinta nada, solo escucha
}