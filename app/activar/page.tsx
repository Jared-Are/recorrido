"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, CheckCircle, AlertCircle, ArrowRight, KeyRound } from "lucide-react";

function ActivarCuentaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const tokenUrl = searchParams.get("token");
  const [token, setToken] = useState(tokenUrl || "");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [viewState, setViewState] = useState<"form" | "success" | "error">("form");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (tokenUrl) {
        setToken(tokenUrl);
        window.history.replaceState(null, '', '/activar');
    }
  }, [tokenUrl]);

  // --- FUNCIÓN PARA FILTRAR SOLO NÚMEROS ---
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const value = e.target.value;
    // Regex: Solo permite dígitos (0-9)
    if (/^\d*$/.test(value)) {
        setter(value);
    }
  };

  const handleActivar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
        setViewState("error");
        setErrorMessage("No se encontró el token de activación.");
        return;
    }
    
    // Validación estricta de 6 dígitos
    if (password.length !== 6) {
        toast({ title: "PIN incompleto", description: "La contraseña debe ser de 6 dígitos numéricos.", variant: "destructive" });
        return;
    }
    if (password !== confirmPassword) {
        toast({ title: "Error", description: "Los PINs no coinciden.", variant: "destructive" });
        return;
    }

    setLoading(true);
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        
        const res = await fetch(`${apiUrl}/users/activar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password })
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            let serverMsg = data.message || "Error desconocido";
            if (Array.isArray(serverMsg)) serverMsg = serverMsg.join(", ");
            
            if (serverMsg.toLowerCase().includes("inválido") || serverMsg.toLowerCase().includes("expirado")) {
                setViewState("error");
                setErrorMessage("Este enlace de invitación ya fue utilizado o ha caducado.");
                return; 
            }
            throw new Error(serverMsg);
        }

        setViewState("success");
        toast({ 
            title: "¡Cuenta Activada!", 
            description: "PIN de seguridad establecido.", 
            className: "bg-green-600 text-white border-none"
        });
        
        setTimeout(() => router.push("/login"), 2500);

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

  if (!token && !tokenUrl && viewState !== "success") {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md text-center p-8 border-amber-200 bg-amber-50 shadow-lg">
                 <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-amber-600" />
                 </div>
                 <h2 className="text-xl font-bold text-amber-800 mb-2">Enlace no disponible</h2>
                 <p className="text-amber-700/80 mb-6 text-sm">
                    {errorMessage || "El enlace de invitación está roto o incompleto."}
                 </p>
                 <Button onClick={() => router.push("/login")} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                    Ir a Iniciar Sesión <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
            </Card>
        </div>
      );
  }

  if (viewState === "success") {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4">
             <div className="text-center animate-in fade-in zoom-in duration-500">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">¡Todo Listo!</h2>
                <p className="text-green-700">Tu PIN de acceso ha sido guardado.</p>
                <div className="mt-8 flex justify-center items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                    <span className="text-green-600 text-sm font-medium">Entrando al sistema...</span>
                </div>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary animate-in fade-in duration-500">
            <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Crear PIN de Acceso</CardTitle>
                <CardDescription>
                    Define un código numérico de 6 dígitos para entrar.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleActivar} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="pass">Nuevo PIN (6 dígitos)</Label>
                        <div className="relative">
                            <Input 
                                id="pass" 
                                type="password" 
                                inputMode="numeric" // Abre teclado numérico en móviles
                                maxLength={6}
                                placeholder="******" 
                                value={password}
                                onChange={(e) => handleNumberChange(e, setPassword)}
                                required
                                className="h-12 text-center text-lg tracking-widest font-mono"
                            />
                            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm">Confirmar PIN</Label>
                        <div className="relative">
                            <Input 
                                id="confirm" 
                                type="password" 
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="******" 
                                value={confirmPassword}
                                onChange={(e) => handleNumberChange(e, setConfirmPassword)}
                                required
                                className="h-12 text-center text-lg tracking-widest font-mono"
                            />
                            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                    
                    <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                            </>
                        ) : (
                            "Establecer PIN y Entrar"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}

export default function ActivarPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen bg-slate-50"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
            <ActivarCuentaContent />
        </Suspense>
    );
}