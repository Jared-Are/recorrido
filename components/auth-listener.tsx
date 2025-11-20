"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// CAMBIO: Agregamos 'default' aquí
export default function AuthListener() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("Detectado evento de recuperación, redirigiendo...");
        router.push("/actualizar-password");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}