"use client"

import { useState, useEffect } from "react"
import { TutorLayout } from "@/components/tutor-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, CheckCircle, AlertCircle, DollarSign, Bell, Clock, CheckCircle2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function TutorDashboardPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [resumen, setResumen] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchResumen = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                if (!token) throw new Error("Sesión no válida.");

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tutor/resumen`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    // Si el Backend responde 404 o 204 (tablas vacías), lo tratamos como data vacía
                    if (response.status === 404 || response.status === 204) {
                        setResumen({ hijos: [], avisos: [], pagos: { estado: 'al_dia', montoPendiente: 0 } });
                        return;
                    }
                    
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error al cargar datos (${response.status})`);
                }

                const data = await response.json();
                setResumen(data);

            } catch (err: any) {
                console.error("Error al cargar resumen del tutor:", err);
                setError(err.message);
                toast({ title: "Error", description: err.message, variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchResumen();
    }, [toast]);

    if (loading) {
        return (
            <TutorLayout title="Panel Familiar">
                <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 animate-spin text-muted-foreground" /></div>
            </TutorLayout>
        );
    }
    
    // Si hay un error de conexión grave (no 404 de datos)
    if (error && resumen?.hijos?.length === 0) {
        return (
             <TutorLayout title="Panel Familiar">
                <div className="flex flex-col justify-center items-center h-64 text-center p-6 bg-red-50 rounded-lg border border-red-100">
                    <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-bold text-red-700 mb-2">No se pudieron cargar tus datos</h3>
                    <p className="text-muted-foreground max-w-md">{error}</p>
                    <Button className="mt-4" onClick={() => window.location.reload()}>
                        Recargar
                    </Button>
                </div>
            </TutorLayout>
        );
    }

    if (!resumen || resumen.hijos.length === 0) {
        return (
            <TutorLayout title="Panel Familiar">
                 <Card className="border-l-4 border-l-orange-500">
                    <CardHeader>
                        <CardTitle>Sin Alumnos Vinculados</CardTitle>
                        <CardDescription>
                           Tu cuenta aún no está asociada a ningún estudiante.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <p className="text-sm text-muted-foreground">Por favor, contacta al administrador de Recorrido Escolar para que te vinculen con tus hijos.</p>
                       <Link href="/dashboard/tutor/avisos">
                            <Button size="sm" variant="outline" className="mt-4">Ver Comunicados (Avisos)</Button>
                        </Link>
                    </CardContent>
                </Card>
            </TutorLayout>
        )
    }

    return (
        <TutorLayout title="Panel Familiar">
            <div className="space-y-6">
                
                {/* --- SECCIÓN DE PAGOS Y AVISOS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <Card className={`md:col-span-2 border-l-4 ${resumen.pagos.estado === 'al_dia' ? 'border-l-green-500' : 'border-l-orange-500'}`}>
                        <CardHeader className="flex-row items-center justify-between pb-2">
                           <CardTitle className="text-xl">Estado de Pagos</CardTitle>
                           <DollarSign className={`h-6 w-6 ${resumen.pagos.estado === 'al_dia' ? 'text-green-500' : 'text-orange-500'}`} />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {resumen.pagos.estado === 'al_dia' ? '¡Al Día!' : `C$ ${resumen.pagos.montoPendiente.toLocaleString()}`}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {resumen.pagos.estado === 'al_dia' ? 'No se detectan pagos pendientes.' : 'Tienes saldo pendiente por cubrir.'}
                            </p>
                            {resumen.pagos.estado !== 'al_dia' && (
                                <Link href="/dashboard/tutor/pagos">
                                    <Button size="sm" className="mt-3">Ver Pagos Pendientes</Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-yellow-500">
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xl">Avisos ({resumen.avisos.length})</CardTitle>
                            <Bell className="h-6 w-6 text-yellow-500" />
                        </CardHeader>
                         <CardContent>
                            {resumen.avisos.length > 0 ? (
                                <p className="text-sm text-foreground">Tienes {resumen.avisos.length} avisos importantes sin leer.</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">No hay avisos recientes para tu familia.</p>
                            )}
                            <Link href="/dashboard/tutor/avisos">
                                <Button variant="outline" size="sm" className="mt-3">Ver Comunicados</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* --- ESTADO DE HIJOS --- */}
                <h3 className="text-xl font-bold pt-4">Estado de Asistencia Hoy</h3>
                <div className="space-y-4">
                    {resumen.hijos.map((hijo: any) => (
                        <Card key={hijo.id} className={`border-l-4 ${hijo.estadoHoy === 'presente' ? 'border-l-green-500' : hijo.estadoHoy === 'ausente' ? 'border-l-red-500' : 'border-l-gray-300'}`}>
                            <CardHeader className="flex-row items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <User className="h-5 w-5 text-purple-600" />
                                    <CardTitle>{hijo.nombre}</CardTitle>
                                </div>
                                <Badge variant={hijo.estadoHoy === 'presente' ? 'default' : hijo.estadoHoy === 'ausente' ? 'destructive' : 'secondary'} className="capitalize">
                                   {hijo.estadoHoy === 'presente' ? 'Recogido' : hijo.estadoHoy === 'ausente' ? 'Ausente' : 'Pendiente'}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Grado: {hijo.grado}</p>
                                {hijo.estadoHoy === 'presente' && (
                                    <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
                                        <CheckCircle className="h-4 w-4" /> Recogido a las {hijo.horaRecogida ? new Date(hijo.horaRecogida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'hora desconocida'}
                                    </p>
                                )}
                                {hijo.vehiculoFotoUrl && (
                                    <img src={hijo.vehiculoFotoUrl} alt="Bus" className="mt-4 w-20 h-auto rounded-lg shadow" />
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Link href="/dashboard/tutor/asistencia">
                    <Button variant="link" className="text-purple-600">Ver historial de asistencia &rarr;</Button>
                </Link>
            </div>
        </TutorLayout>
    );
}