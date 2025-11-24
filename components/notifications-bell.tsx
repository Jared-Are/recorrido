"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";

type Notificacion = {
    id: string;
    titulo: string;
    mensaje: string;
    leido: boolean;
    fechaCreacion: string;
};

export function NotificationsBell() {
  const [count, setCount] = useState(0);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Cargar inicial
  const fetchNotificaciones = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const token = session.access_token;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    // 1. Traer conteo no leídas
    const resCount = await fetch(`${apiUrl}/notificaciones/count`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (resCount.ok) setCount(await resCount.json());

    // 2. Traer lista
    const resList = await fetch(`${apiUrl}/notificaciones`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (resList.ok) setNotificaciones(await resList.json());
  };

  useEffect(() => {
    fetchNotificaciones();
    // Aquí podrías conectar el socket también para actualizar el contador en vivo
    const interval = setInterval(fetchNotificaciones, 60000); // Polling cada 1 min como respaldo
    return () => clearInterval(interval);
  }, []);

  const handleOpen = async (open: boolean) => {
      setIsOpen(open);
      if (open && count > 0) {
          // Marcar como leídas al abrir
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
              await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notificaciones/leer-todas`, {
                  method: 'PATCH',
                  headers: { Authorization: `Bearer ${session.access_token}` }
              });
              setCount(0); // Limpiar puntito visualmente
          }
      }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 border border-white dark:border-slate-950" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b font-semibold">Notificaciones</div>
        <ScrollArea className="h-[300px]">
            {notificaciones.length === 0 ? (
                <p className="text-center text-muted-foreground p-4 text-sm">No tienes notificaciones.</p>
            ) : (
                <div className="divide-y">
                    {notificaciones.map((n) => (
                        <div key={n.id} className={`p-4 text-sm ${n.leido ? 'bg-background' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}>
                            <p className="font-medium">{n.titulo}</p>
                            <p className="text-muted-foreground text-xs mt-1">{n.mensaje}</p>
                            <p className="text-[10px] text-gray-400 mt-2 text-right">
                                {new Date(n.fechaCreacion).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}