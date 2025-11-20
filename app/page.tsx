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
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    // --- DEBUGGING LOGS (Abre la consola con F12 para ver esto) ---
    console.log("1. Iniciando login con usuario:", identifier);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      console.log("2. Consultando backend en:", apiUrl);
      
      const lookupRes = await fetch(`${apiUrl}/users/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier }),
      });

      if (!lookupRes.ok) {
        console.error("Error Backend:", lookupRes.status, await lookupRes.text());
        throw new Error("Usuario no encontrado en el sistema.");
      }

      const dataBackend = await lookupRes.json();
      const realEmail = dataBackend.email;
      
      console.log("3. Email encontrado por backend:", realEmail);
      console.log("4. Intentando login en Supabase con:", { email: realEmail, password: '***' });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: realEmail,
        password: password,
      });

      if (error) {
        console.error("5. Error Supabase:", error.message);
        throw error;
      }

      console.log("6. ¡Login Exitoso!", data);

      if (remember) {
        localStorage.setItem("rememberedUser", identifier);
      } else {
        localStorage.removeItem("rememberedUser");
      }

      toast({ title: "Bienvenido", description: "Accediendo al sistema..." });

      const rol = data.user?.user_metadata?.rol;
      console.log("7. Rol detectado:", rol);

      switch (rol) {
        case 'propietario':
          router.push("/dashboard/propietario/alumnos");
          break;
        case 'tutor':
          router.push("/dashboard/tutor"); 
          break;
        case 'asistente':
          router.push("/dashboard/asistente");
          break;
        default:
          router.push("/dashboard/propietario/alumnos");
      }

    } catch (err: any) {
      console.error("❌ Error final:", err);
      if (err.message === "Usuario no encontrado en el sistema.") {
         setError("El usuario ingresado no existe en nuestra base de datos.");
      } else if (err.message.includes("Invalid login credentials")) {
         setError("Contraseña incorrecta. Verifica o pide un nuevo link.");
      } else {
         setError("Error de conexión. Revisa la consola (F12).");
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
            Recorrido Escolar
          </CardTitle>
          <CardDescription className="text-pretty">
            Ingresa tus credenciales para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Usuario o Teléfono</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Ej: juan.perez"
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}