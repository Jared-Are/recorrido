"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Conexión única (usando variable de entorno o fallback)
// autoConnect: false para tener control manual basado en la sesión
const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000", {
  autoConnect: false,
  reconnection: true, // Intentar reconectar si se cae la red
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
});

export default function RealTimeListener() {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // 1. GESTIÓN DE CONEXIÓN BASADA EN SESIÓN
    const manageConnection = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
            if (!socket.connected) {
                console.log("🟢 Usuario autenticado: Conectando WebSockets...");
                socket.connect();
            }
        } else {
            if (socket.connected) {
                console.log("🔴 Sesión cerrada: Desconectando WebSockets...");
                socket.disconnect();
            }
        }
    };

    // Ejecutar al montar
    manageConnection();

    // Escuchar cambios de sesión (Login/Logout/Expiración)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (!socket.connected) socket.connect();
        } else if (event === 'SIGNED_OUT') {
            if (socket.connected) socket.disconnect();
        }
    });

    // 2. CONFIGURAR EVENTOS DE ESCUCHA
    
    socket.on("connect", () => {
        console.log("✅ Conectado al servidor de Tiempo Real");
    });

    socket.on("disconnect", () => {
        console.log("❌ Desconectado del servidor");
    });

    // --- EVENTO A: NUEVO PAGO ---
    socket.on('nuevo-pago', (data) => {
        // Solo mostramos la alerta, el filtro de si es "para mí" lo hacemos simple
        // (En un futuro podrías validar IDs aquí si es necesario)
        console.log("🔔 Evento recibido: nuevo-pago", data);
        
        toast({
            title: "💰 Pago Registrado",
            description: `C$ ${Number(data.monto).toLocaleString()} - ${data.alumnoNombre}`,
            className: "border-l-4 border-green-500 bg-white dark:bg-slate-950 shadow-lg"
        });
        
        // Refrescamos los datos de la pantalla actual por si estamos viendo la tabla de pagos
        router.refresh();
    });

    // --- EVENTO B: MONITOR DE RUTA ---
    socket.on('nueva-asistencia-lote', async (data) => {
        const { data: { user } } = await supabase.auth.getUser();
        if(!user) return;
        
        const rol = user.user_metadata?.rol?.toLowerCase();

        // Admin/Propietario: Ve detalles técnicos
        if (rol === 'propietario' || rol === 'admin') {
            toast({
                title: "🚌 Actividad en Ruta",
                description: `${data.asistente} registró asistencia en ${data.vehiculo}.`,
                className: "border-l-4 border-blue-500 bg-white dark:bg-slate-950 shadow-lg"
            });
        }

        // Padre/Tutor: Ve aviso amigable
        if (rol === 'tutor' || rol === 'padre') {
            toast({
                title: "🚌 Tu transporte está activo",
                description: `El vehículo ${data.vehiculo} acaba de actualizar su estado.`,
                className: "border-l-4 border-yellow-500 bg-white dark:bg-slate-950 shadow-lg"
            });
        }
    });

    // 3. LIMPIEZA AL DESMONTAR
    return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('nuevo-pago');
        socket.off('nueva-asistencia-lote');
        authListener.subscription.unsubscribe();
    };
  }, [toast, router]);

  return null;
}