"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bus, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [identifier, setIdentifier] = useState(""); // "Usuario" (puede ser username, tel o email)
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Recuperar usuario guardado si marcó "Recordarme"
  useEffect(() => {
    const savedUser = localStorage.getItem("rememberedUser");
    if (savedUser) {
      setIdentifier(savedUser);
      setRemember(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // PASO 1: Averiguar el EMAIL real detrás del Usuario/Teléfono
      // Llamamos a nuestro propio backend para esto
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      
      const lookupRes = await fetch(`${apiUrl}/users/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier }),
      });

      if (!lookupRes.ok) {
        // Si el backend no encuentra el usuario
        throw new Error("Usuario no encontrado en el sistema.");
      }

      const { email: realEmail } = await lookupRes.json();

      // PASO 2: Login en Supabase usando el EMAIL recuperado
      const { data, error } = await supabase.auth.signInWithPassword({
        email: realEmail,
        password: password,
      });

      if (error) throw error;

      // PASO 3: Guardar preferencia "Recordarme"
      if (remember) {
        localStorage.setItem("rememberedUser", identifier); // Guardamos lo que escribió el usuario
      } else {
        localStorage.removeItem("rememberedUser");
      }

      toast({ title: "Bienvenido", description: "Accediendo al sistema..." });

      // PASO 4: Redirección según ROL
      const rol = data.user?.user_metadata?.rol;

      switch (rol) {
        case 'propietario':
          router.push("/dashboard/propietario");
          break;
        case 'tutor':
          router.push("/dashboard/tutor"); 
          break;
        case 'asistente':
          router.push("/dashboard/asistente");
          break;
        default:
          // Si no tiene rol o es desconocido, lo mandamos al login o home
          router.push("/login"); 
      }

    } catch (err: any) {
      console.error(err);
      // Mensaje amigable para el usuario
      if (err.message === "Usuario no encontrado en el sistema.") {
         setError("El usuario ingresado no existe.");
      } else if (err.message.includes("Invalid login credentials")) {
         setError("Contraseña incorrecta.");
      } else {
         setError("Error al iniciar sesión. Verifica tus datos.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Bus className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-balance">
            Recorrido Escolar Arévalo Hernández
          </CardTitle>
          <CardDescription className="text-pretty">
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Usuario</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Ej: juan.perez o 5058888..."
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="remember" className="cursor-pointer font-normal">
                Recordarme
              </Label>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
             ¿Problemas para entrar? Contacta al administrador.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}