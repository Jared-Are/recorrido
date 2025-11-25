"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bus, AlertCircle, Loader2, Lock, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("rememberedUser");
    if (savedUser) {
      setUsername(savedUser);
      setRemember(true);
    }
  }, []);

  // --- VALIDACIÓN DE USUARIO (Solo letras, números y puntos) ---
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Regex: ^[a-zA-Z0-9.]*$ significa: "Solo permite inicio a fin caracteres alfanuméricos y puntos"
    if (/^[a-zA-Z0-9.]*$/.test(val)) {
        setUsername(val);
    }
  };

  // --- VALIDACIÓN DE CONTRASEÑA (Solo números, máx 6) ---
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Regex: /^\d*$/ significa "Solo dígitos"
    if (/^\d*$/.test(val)) {
        if (val.length <= 6) { // Límite estricto de 6
            setPassword(val);
        }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password.length !== 6) {
        setError("La contraseña debe ser un PIN de 6 números.");
        return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      
      const res = await fetch(`${apiUrl}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            username: username.toLowerCase(), // Aseguramos minúsculas
            contrasena: password 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Credenciales incorrectas");
      }

      localStorage.setItem("currentUser", JSON.stringify(data));

      if (remember) localStorage.setItem("rememberedUser", username);
      else localStorage.removeItem("rememberedUser");

      toast({ title: "Bienvenido", description: "Iniciando sesión..." });

      if (data.rol === 'propietario') router.push('/dashboard/propietario');
      else if (data.rol === 'tutor') router.push('/dashboard/tutor');
      else if (data.rol === 'asistente') router.push('/dashboard/asistente');
      else router.push('/dashboard');

    } catch (err: any) {
      console.error("Error login:", err);
      setError(err.message || "Error de conexión.");
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
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="Ej: juan.perez"
                  className="pl-9"
                  value={username}
                  onChange={handleUsernameChange} // Usamos la validación segura
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña (PIN)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    id="password"
                    type="password"
                    inputMode="numeric" // Abre teclado numérico en celular
                    maxLength={6}       // Límite HTML nativo
                    className="pl-9 tracking-widest font-mono" // Separación para que parezca PIN
                    placeholder="******"
                    value={password}
                    onChange={handlePasswordChange} // Usamos la validación segura
                    required
                    disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="remember" className="cursor-pointer font-normal text-muted-foreground">
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
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                 </>
              ) : (
                 "Iniciar Sesión"
              )}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted rounded-lg text-center">
             <p className="text-xs text-muted-foreground">
               Si olvidaste tu contraseña, contacta al administrador.
             </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}