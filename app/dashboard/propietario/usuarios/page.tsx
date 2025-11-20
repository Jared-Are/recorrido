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
import { supabase } from "@/lib/supabase"; // <--- Importamos Supabase

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

    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [solicitudes, setSolicitudes] = useState<any[]>([]);

    const [newUser, setNewUser] = useState({
        nombre: "",
        email: "",
        telefono: "",
        rol: "tutor",
        username: "",
    });

    // Helper para manejar 404/204 como lista vacía
    const handleFetchResponse = async (res: Response, type: 'users' | 'solicitudes') => {
        if (res.ok) {
            return await res.json();
        }
        // Si no hay datos (404 o 204), retornamos un array vacío
        if (res.status === 404 || res.status === 204) {
            return [];
        }
        // Si es otro error, lanzamos excepción
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al cargar ${type} (${res.status})`);
    };

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

            const usuariosData = await handleFetchResponse(resUsers, 'users');
            const solicitudesData = await handleFetchResponse(resSolicitudes, 'solicitudes');

            setUsuarios(usuariosData);
            setSolicitudes(solicitudesData);
            
        } catch (err: any) {
            console.error(err);
            setError(err.message);
            toast({
                title: "Error de conexión",
                description: (err as Error).message,
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
            
            // Enviamos el token en los headers
            const res = await fetch(`${apiUrl}/users`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    ...newUser,
                    // Estos campos ya no son estrictamente necesarios porque el service los maneja
                    estatus: "INVITADO", 
                    contrasena: undefined,
                    username: newUser.username || undefined,
                }),
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Error creando usuario");
            }

            toast({
                title: "Usuario creado",
                description: "Ahora puedes enviarle la invitación.",
            });
            setIsOpen(false);
            setNewUser({ nombre: "", email: "", telefono: "", rol: "tutor", username: "" });
            fetchData();
        } catch (error) {
            toast({
                title: "Error",
                description: (error as Error).message || "No se pudo crear el usuario.",
                variant: "destructive",
            });
        }
    };

    // 3. Enviar Invitación por WhatsApp
    const handleEnviarInvitacion = async (id: string, nombre: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) throw new Error("Sesión no válida.");

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const res = await fetch(`${apiUrl}/users/${id}/invitacion`, {
                method: "POST",
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!res.ok) {
                 const errorData = await res.json().catch(() => ({}));
                 throw new Error(errorData.message || "Error generando link");
            }

            const data = await res.json();
            const texto = encodeURIComponent(data.mensaje);

            const url = `https://wa.me/${data.telefono}?text=${texto}`;
            window.open(url, "_blank");

            toast({
                title: "WhatsApp abierto",
                description: `Invitación generada para ${nombre}`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: (error as Error).message || "No se pudo generar la invitación",
                variant: "destructive",
            });
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
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            if (!res.ok) {
                 const errorData = await res.json().catch(() => ({}));
                 throw new Error(errorData.message || "Error al aprobar");
            }

            toast({ title: "Solicitud Aprobada", description: "Usuario creado." });
            fetchData();
        } catch (error) {
            toast({
                title: "Error",
                description: (error as Error).message || "Falló la aprobación.",
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
                 const errorData = await res.json().catch(() => ({}));
                 throw new Error(errorData.message || "Error al eliminar");
            }
            
            toast({ title: "Eliminado correctamente" });
            fetchData();
        } catch (error) {
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
                                        <Label>Nombre Completo</Label>
                                        <Input
                                            value={newUser.nombre}
                                            onChange={(e) =>
                                                setNewUser({ ...newUser, nombre: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Teléfono (WhatsApp)</Label>
                                            <div className="relative">
                                                <Smartphone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    className="pl-8"
                                                    placeholder="505..."
                                                    value={newUser.telefono}
                                                    onChange={(e) =>
                                                        setNewUser({ ...newUser, telefono: e.target.value })
                                                    }
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Rol</Label>
                                            <Select
                                                value={newUser.rol}
                                                onValueChange={(v) =>
                                                    setNewUser({ ...newUser, rol: v })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="asistente">Asistente</SelectItem>
                                                    <SelectItem value="tutor">Tutor</SelectItem>
                                                    <SelectItem value="propietario">
                                                        Administrador
                                                    </SelectItem>
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
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Usuario (Login)</TableHead>
                                            <TableHead>Rol</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {usuarios.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                    No hay usuarios registrados.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            usuarios.map((u) => (
                                                <TableRow key={u.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{u.nombre}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {u.telefono}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-blue-700">
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
                                                                    : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                                            }
                                                        >
                                                            {u.estatus || "INVITADO"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end items-center gap-2">
                                                            {/* El estatus ahora es ACTIVO en la BD al crear, pero si el usuario aún no pone contraseña en Supabase, la invitación es válida */}
                                                            {u.estatus === "INVITADO" && ( 
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700 text-white h-8"
                                                                    onClick={() => handleEnviarInvitacion(u.id, u.nombre)}
                                                                >
                                                                    <Send className="w-3 h-3 mr-2" /> Invitar
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
                                                <TableHead>Dirección</TableHead>
                                                <TableHead className="text-right">Decisión</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {solicitudes.map((s) => (
                                                <TableRow key={s.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{s.padreNombre}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {s.telefono}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{s.hijoNombre}</TableCell>
                                                    <TableCell>{s.direccion}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 hover:bg-red-50"
                                                                onClick={() =>
                                                                    handleDelete(s.id, "solicitudes")
                                                                }
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