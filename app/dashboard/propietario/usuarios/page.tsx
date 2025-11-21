"use client";

import { useState, useEffect } from "react";
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Users,
    DollarSign,
    Bus,
    UserCog,
    Bell,
    BarChart3,
    TrendingDown,
    Plus,
    Trash2,
    Check,
    X,
    Shield,
    User,
    Loader2,
    Send,
    Smartphone,
    AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const menuItems: MenuItem[] = [
    { title: "Gestionar Alumnos", description: "Ver y administrar estudiantes", icon: Users, href: "/dashboard/propietario/alumnos", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20", },
    { title: "Gestionar Pagos", description: "Ver historial y registrar pagos", icon: DollarSign, href: "/dashboard/propietario/pagos", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20", },
    { title: "Gestionar Gastos", description: "Control de combustible, salarios, etc.", icon: TrendingDown, href: "/dashboard/propietario/gastos", color: "text-pink-600", bgColor: "bg-pink-50 dark:bg-pink-900/20", },
    { title: "Gestionar Personal", description: "Administrar empleados y choferes", icon: Users, href: "/dashboard/propietario/personal", color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-900/20", },
    { title: "Gestionar Vehículos", description: "Administrar flota de vehículos", icon: Bus, href: "/dashboard/propietario/vehiculos", color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900/20", },
    { title: "Gestionar Usuarios", description: "Administrar accesos al sistema", icon: UserCog, href: "/dashboard/propietario/usuarios", color: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-900/20", },
    { title: "Enviar Avisos", description: "Comunicados a tutores y personal", icon: Bell, href: "/dashboard/propietario/avisos", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-900/20", },
    { title: "Generar Reportes", description: "Estadísticas y análisis", icon: BarChart3, href: "/dashboard/propietario/reportes", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20", },
];

export default function UsuariosPage() {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sendingInvitation, setSendingInvitation] = useState<string | null>(null);

    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [solicitudes, setSolicitudes] = useState<any[]>([]);

    const [newUser, setNewUser] = useState({
        nombre: "",
        email: "",
        telefono: "",
        rol: "tutor",
        username: "",
    });

    // 1. Cargar Datos
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Sesión no válida o expirada.");

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            
            const [resUsers, resSolicitudes] = await Promise.all([
                fetch(`${apiUrl}/users`, { headers }),
                fetch(`${apiUrl}/solicitudes`, { headers }),
            ]);

            // Manejo mejorado de respuestas
            if (!resUsers.ok) {
                const errorText = await resUsers.text();
                console.error("Error cargando usuarios:", resUsers.status, errorText);
                if (resUsers.status === 404 || resUsers.status === 204) {
                    setUsuarios([]);
                } else {
                    throw new Error(`Error ${resUsers.status} al cargar usuarios`);
                }
            } else {
                const usuariosData = await resUsers.json();
                setUsuarios(usuariosData);
            }

            if (!resSolicitudes.ok) {
                const errorText = await resSolicitudes.text();
                console.error("Error cargando solicitudes:", resSolicitudes.status, errorText);
                if (resSolicitudes.status === 404 || resSolicitudes.status === 204) {
                    setSolicitudes([]);
                } else {
                    throw new Error(`Error ${resSolicitudes.status} al cargar solicitudes`);
                }
            } else {
                const solicitudesData = await resSolicitudes.json();
                setSolicitudes(solicitudesData);
            }
            
        } catch (err: any) {
            console.error("Error en fetchData:", err);
            setError(err.message);
            toast({
                title: "Error de conexión",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. Crear Usuario Manual
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Sesión no válida.");

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            
            const res = await fetch(`${apiUrl}/users`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    ...newUser,
                    estatus: "INVITADO"
                }),
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                console.error("Error creando usuario:", res.status, errorText);
                throw new Error(`Error ${res.status} creando usuario`);
            }

            toast({
                title: "Usuario creado",
                description: "Ahora puedes enviarle la invitación.",
            });
            setIsOpen(false);
            setNewUser({ nombre: "", email: "", telefono: "", rol: "tutor", username: "" });
            fetchData();
        } catch (error) {
            console.error("Error en handleCreateUser:", error);
            toast({
                title: "Error",
                description: (error as Error).message,
                variant: "destructive",
            });
        }
    };

    // 3. Enviar Invitación por WhatsApp - VERSIÓN DEBUG
    const handleEnviarInvitacion = async (id: string, nombre: string, telefono: string) => {
        setSendingInvitation(id);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Sesión no válida.");

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            
            console.log("🔍 DEBUG - Iniciando invitación:", { 
                id, 
                nombre, 
                telefono,
                apiUrl: `${apiUrl}/users/${id}/invitacion`
            });

            // PRIMERO: Verificar que el usuario existe y tiene los datos correctos
            const userRes = await fetch(`${apiUrl}/users/${id}`, {
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!userRes.ok) {
                const errorText = await userRes.text();
                console.error("❌ Error obteniendo usuario:", userRes.status, errorText);
                throw new Error(`No se pudo obtener datos del usuario (${userRes.status})`);
            }

            const userData = await userRes.json();
            console.log("✅ Datos del usuario:", userData);

            // SEGUNDO: Intentar generar la invitación
            console.log("🔄 Enviando petición de invitación...");
            const res = await fetch(`${apiUrl}/users/${id}/invitacion`, {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            console.log("📊 Respuesta del servidor:", {
                status: res.status,
                statusText: res.statusText,
                ok: res.ok
            });

            if (!res.ok) {
                let errorMessage = `Error ${res.status} generando invitación`;
                try {
                    const errorData = await res.json();
                    console.error("❌ Error detallado:", errorData);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (parseError) {
                    const errorText = await res.text();
                    console.error("❌ Error texto:", errorText);
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await res.json();
            console.log("✅ Datos de invitación:", data);

            // Validar datos mínimos
            if (!data.mensaje) {
                throw new Error("El servidor no devolvió el mensaje de invitación");
            }

            if (!telefono) {
                throw new Error("El usuario no tiene número de teléfono registrado");
            }

            // Preparar mensaje para WhatsApp
            const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
            const texto = encodeURIComponent(data.mensaje);
            const url = `https://wa.me/${telefonoLimpio}?text=${texto}`;
            
            console.log("📱 URL de WhatsApp generada:", url);
            
            // Abrir WhatsApp
            window.open(url, "_blank");

            toast({
                title: "✅ WhatsApp abierto",
                description: `Invitación enviada a ${nombre}`,
            });

        } catch (error) {
            console.error("💥 Error completo en handleEnviarInvitacion:", error);
            toast({
                title: "❌ Error al enviar invitación",
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
            setSendingInvitation(null);
        }
    };

    // 4. Aprobar Solicitud
    const handleAprobarSolicitud = async (id: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Sesión no válida.");

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(`${apiUrl}/solicitudes/${id}/aprobar`, {
                method: "PATCH",
                 headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                console.error("Error aprobando solicitud:", res.status, errorText);
                throw new Error(`Error ${res.status} al aprobar`);
            }

            toast({ title: "Solicitud Aprobada", description: "Usuario creado." });
            fetchData();
        } catch (error) {
            console.error("Error en handleAprobarSolicitud:", error);
            toast({
                title: "Error",
                description: (error as Error).message,
                variant: "destructive",
            });
        }
    };

    // 5. Eliminar
    const handleDelete = async (id: string, type: "users" | "solicitudes") => {
        if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Sesión no válida.");

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(`${apiUrl}/${type}/${id}`, { 
                method: "DELETE",
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                console.error("Error eliminando:", res.status, errorText);
                throw new Error(`Error ${res.status} al eliminar`);
            }
            
            toast({ title: "Eliminado correctamente" });
            fetchData();
        } catch (error) {
            console.error("Error en handleDelete:", error);
            toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
        }
    };
    
    if (loading) {
        return (
            <DashboardLayout title="Gestión de Acceso" menuItems={menuItems}>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="ml-3 text-muted-foreground">Cargando usuarios y solicitudes...</p>
                </div>
            </DashboardLayout>
        );
    }
    
    if (error) {
        return (
            <DashboardLayout title="Gestión de Acceso" menuItems={menuItems}>
                <div className="flex flex-col justify-center items-center h-64 text-center p-6 bg-red-50 rounded-lg border border-red-100">
                    <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-red-700 mb-2">Error de conexión</h3>
                    <p className="text-muted-foreground max-w-md">{error}</p>
                    <Button className="mt-4" onClick={fetchData}>
                        Intentar de nuevo
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestión de Acceso" menuItems={menuItems}>
            <div className="space-y-6">
                <Tabs defaultValue="activos" className="w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                        <TabsList>
                            <TabsTrigger value="activos">Usuarios del Sistema</TabsTrigger>
                            <TabsTrigger value="espera" className="relative">
                                Solicitudes Pendientes
                                {solicitudes.length > 0 && (
                                    <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                                        {solicitudes.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" /> Nuevo Usuario
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Crear Usuario Manual</DialogTitle>
                                    <DialogDescription>
                                        Crea un acceso para personal o tutor. Se enviará un link de activación.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateUser} className="space-y-4 py-2">
                                    <div className="space-y-2">
                                        <Label>Nombre Completo *</Label>
                                        <Input
                                            value={newUser.nombre}
                                            onChange={(e) =>
                                                setNewUser({ ...newUser, nombre: e.target.value })
                                            }
                                            required
                                            placeholder="Ej: María González"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email *</Label>
                                        <Input
                                            type="email"
                                            value={newUser.email}
                                            onChange={(e) =>
                                                setNewUser({ ...newUser, email: e.target.value })
                                            }
                                            required
                                            placeholder="Ej: maria@ejemplo.com"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Teléfono (WhatsApp) *</Label>
                                            <div className="relative">
                                                <Smartphone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    className="pl-8"
                                                    placeholder="50512345678"
                                                    value={newUser.telefono}
                                                    onChange={(e) =>
                                                        setNewUser({ ...newUser, telefono: e.target.value })
                                                    }
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Rol *</Label>
                                            <Select
                                                value={newUser.rol}
                                                onValueChange={(v) =>
                                                    setNewUser({ ...newUser, rol: v })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona rol" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="asistente">Asistente</SelectItem>
                                                    <SelectItem value="tutor">Tutor</SelectItem>
                                                    <SelectItem value="propietario">Administrador</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button type="submit">Crear Usuario</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <TabsContent value="activos">
                        <Card>
                            <CardHeader>
                                <CardTitle>Usuarios del Sistema</CardTitle>
                                <CardDescription>
                                    Gestiona los usuarios con acceso a la plataforma
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Email / Teléfono</TableHead>
                                            <TableHead>Usuario</TableHead>
                                            <TableHead>Rol</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {usuarios.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                    No hay usuarios registrados.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            usuarios.map((u) => (
                                                <TableRow key={u.id}>
                                                    <TableCell className="font-medium">{u.nombre}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="text-sm">{u.email}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {u.telefono}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                                            {u.username || "Pendiente..."}
                                                        </code>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {u.rol === "propietario" ? (
                                                                <Shield className="w-3 h-3 mr-1 text-blue-600" />
                                                            ) : (
                                                                <User className="w-3 h-3 mr-1" />
                                                            )}
                                                            {u.rol}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                u.estatus === "ACTIVO"
                                                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                                    : u.estatus === "INVITADO"
                                                                    ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                                                    : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                                            }
                                                        >
                                                            {u.estatus || "INVITADO"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end items-center gap-2">
                                                            {u.estatus === "INVITADO" && ( 
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700 text-white h-8"
                                                                    onClick={() => handleEnviarInvitacion(u.id, u.nombre, u.telefono)}
                                                                    disabled={sendingInvitation === u.id}
                                                                >
                                                                    {sendingInvitation === u.id ? (
                                                                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                                                    ) : (
                                                                        <Send className="w-3 h-3 mr-2" />
                                                                    )}
                                                                    {sendingInvitation === u.id ? "Enviando..." : "Invitar"}
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-600 h-8 w-8 p-0"
                                                                onClick={() => handleDelete(u.id, "users")}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="espera">
                        <Card className="border-l-4 border-l-orange-400">
                            <CardHeader>
                                <CardTitle>Solicitudes de Ingreso</CardTitle>
                                <CardDescription>
                                    Padres interesados. Al aprobar, se genera el Usuario.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {solicitudes.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No hay solicitudes pendientes.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Padre / Contacto</TableHead>
                                                <TableHead>Alumno</TableHead>
                                                <TableHead>Contacto</TableHead>
                                                <TableHead>Dirección</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {solicitudes.map((s) => (
                                                <TableRow key={s.id}>
                                                    <TableCell className="font-medium">{s.padreNombre}</TableCell>
                                                    <TableCell>{s.hijoNombre}</TableCell>
                                                    <TableCell>{s.telefono}</TableCell>
                                                    <TableCell className="max-w-xs truncate">{s.direccion}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 hover:bg-red-50"
                                                                onClick={() => handleDelete(s.id, "solicitudes")}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700"
                                                                onClick={() => handleAprobarSolicitud(s.id)}
                                                            >
                                                                <Check className="h-4 w-4 mr-2" /> Aprobar
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}