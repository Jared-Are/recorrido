"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

function ActivarCuentaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Estados de la Vista
  const [viewState, setViewState] = useState<"form" | "success" | "error">("form");
  const [errorMessage, setErrorMessage] = useState("");

  const handleActivar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones locales
    if (!token) {
        setViewState("error");
        setErrorMessage("El enlace de invitación está incompleto.");
        return;
    }
    if (password.length < 6) {
        toast({ title: "Contraseña insegura", description: "Usa al menos 6 caracteres.", variant: "destructive" });
        return;
    }
    if (password !== confirmPassword) {
        toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
        return;
    }

    setLoading(true);
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://recorrido-backend-u2dd.onrender.com";
        
        const res = await fetch(`${apiUrl}/users/activar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password })
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            // Analizamos el error
            let serverMsg = data.message || "Error desconocido";
            if (Array.isArray(serverMsg)) serverMsg = serverMsg.join(", ");
            
            // Si el token ya no sirve, cambiamos la vista completa
            if (
                serverMsg.toLowerCase().includes("inválido") || 
                serverMsg.toLowerCase().includes("expirado") || 
                serverMsg.toLowerCase().includes("not found")
            ) {
                setViewState("error");
                setErrorMessage("Este enlace de invitación ya fue utilizado o ha caducado. Es probable que tu cuenta ya esté activa.");
                return; // Salimos para no mostrar toast
            }
            
            throw new Error(serverMsg);
        }

        // Éxito total
        setViewState("success");
        toast({ 
            title: "¡Bienvenido!", 
            description: "Tu cuenta está lista.", 
            className: "bg-green-600 text-white border-none"
        });
        
        // Redirección automática suave
        setTimeout(() => router.push("/login"), 3000);

    } catch (error: any) {
        console.error("Error activación:", error);
        toast({ 
            title: "No se pudo activar", 
            description: error.message, 
            variant: "destructive"
        });
    } finally {
        setLoading(false);
    }
  };

  // --- VISTA 1: ERROR / TOKEN VENCIDO ---
  if (!token || viewState === "error") {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md text-center p-8 border-amber-200 bg-amber-50 shadow-lg animate-in fade-in zoom-in duration-300">
                 <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-amber-600" />
                 </div>
                 <h2 className="text-xl font-bold text-amber-800 mb-2">Enlace no disponible</h2>
                 <p className="text-amber-700/80 mb-6 text-sm leading-relaxed">
                    {errorMessage || "El enlace de invitación está roto o ya fue utilizado."}
                 </p>
                 <Button 
                    onClick={() => router.push("/login")} 
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                 >
                    Ir a Iniciar Sesión <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
            </Card>
        </div>
      );
  }

  // --- VISTA 2: ÉXITO ---
  if (viewState === "success") {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4">
             <div className="text-center animate-in fade-in zoom-in duration-500">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">¡Cuenta Activada!</h2>
                <p className="text-green-700">Tu contraseña ha sido guardada correctamente.</p>
                <div className="mt-8 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-green-600 mr-2" />
                    <span className="text-green-600 text-sm">Redirigiendo al login...</span>
                </div>
             </div>
        </div>
      );
  }

  // --- VISTA 3: FORMULARIO (Normal) ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary animate-in fade-in duration-500">
            <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Lock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Activar Cuenta</CardTitle>
                <CardDescription>
                    Establece una contraseña segura para acceder a <strong>Recorrido Escolar</strong>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleActivar} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="pass">Nueva Contraseña</Label>
                        <Input 
                            id="pass" 
                            type="password" 
                            placeholder="Mínimo 6 caracteres" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm">Confirmar Contraseña</Label>
                        <Input 
                            id="confirm" 
                            type="password" 
                            placeholder="Repite tu contraseña" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="h-11"
                        />
                    </div>
                    <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Activando...
                            </>
                        ) : (
                            "Guardar y Entrar"
                        )}
                    </Button>
                </form>
                <p className="text-xs text-center text-muted-foreground mt-6">
                    ¿Ya tienes cuenta? <span className="text-primary cursor-pointer hover:underline" onClick={() => router.push("/login")}>Inicia sesión aquí</span>
                </p>
            </CardContent>
        </Card>
    </div>
  );
}

export default function ActivarPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <ActivarCuentaContent />
        </Suspense>
    );
}