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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const menuItems: MenuItem[] = [
  {
    title: "Gestionar Alumnos",
    description: "Ver y administrar estudiantes",
    icon: Users,
    href: "/dashboard/propietario/alumnos",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "Gestionar Pagos",
    description: "Ver historial y registrar pagos",
    icon: DollarSign,
    href: "/dashboard/propietario/pagos",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    title: "Gestionar Gastos",
    description: "Control de combustible, salarios, etc.",
    icon: TrendingDown,
    href: "/dashboard/propietario/gastos",
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
  },
  {
    title: "Gestionar Personal",
    description: "Administrar empleados y choferes",
    icon: Users,
    href: "/dashboard/propietario/personal",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    title: "Gestionar Vehículos",
    description: "Administrar flota de vehículos",
    icon: Bus,
    href: "/dashboard/propietario/vehiculos",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    title: "Gestionar Usuarios",
    description: "Administrar accesos al sistema",
    icon: UserCog,
    href: "/dashboard/propietario/usuarios",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    title: "Enviar Avisos",
    description: "Comunicados a tutores y personal",
    icon: Bell,
    href: "/dashboard/propietario/avisos",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
  },
  {
    title: "Generar Reportes",
    description: "Estadísticas y análisis",
    icon: BarChart3,
    href: "/dashboard/propietario/reportes",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
];

export default function UsuariosPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const [resUsers, resSolicitudes] = await Promise.all([
        fetch(`${apiUrl}/users`),
        fetch(`${apiUrl}/solicitudes`),
      ]);

      if (resUsers.ok) setUsuarios(await resUsers.json());
      if (resSolicitudes.ok) setSolicitudes(await resSolicitudes.json());
    } catch (error) {
      console.error(error);
      toast({
        title: "Error de conexión",
        description: "No se pudieron cargar los datos.",
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newUser,
          estatus: "INVITADO",
          contrasena: undefined,
          username: newUser.username || undefined,
        }),
      });
      if (!res.ok) throw new Error("Error creando usuario");

      toast({
        title: "Usuario creado",
        description: "Ahora puedes enviarle la invitación.",
      });
      setIsOpen(false);
      setNewUser({
        nombre: "",
        email: "",
        telefono: "",
        rol: "tutor",
        username: "",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el usuario. Verifica el teléfono.",
        variant: "destructive",
      });
    }
  };

  // 3. Enviar Invitación por WhatsApp
  const handleEnviarInvitacion = async (id: string, nombre: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/users/${id}/invitacion`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Error generando link");

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
        description: "No se pudo generar la invitación",
        variant: "destructive",
      });
    }
  };

  // 4. Aprobar Solicitud
  const handleAprobarSolicitud = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/solicitudes/${id}/aprobar`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Error al aprobar");

      toast({ title: "Solicitud Aprobada", description: "Usuario creado." });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Falló la aprobación.",
        variant: "destructive",
      });
    }
  };

  // 5. Eliminar
  const handleDelete = async (id: string, type: "users" | "solicitudes") => {
    if (!confirm("¿Estás seguro?")) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      await fetch(`${apiUrl}/${type}/${id}`, { method: "DELETE" });
      toast({ title: "Eliminado correctamente" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

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
                    Crear acceso para personal o tutor.
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
                      <TableHead>Usuario (Login)</TableHead>{" "}
                      {/* NUEVA COLUMNA */}
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <Loader2 className="mx-auto animate-spin" />
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
                          {/* MOSTRAR EL USERNAME GENERADO */}
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
                              {u.estatus !== "ACTIVO" && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white h-8"
                                  onClick={() =>
                                    handleEnviarInvitacion(u.id, u.nombre)
                                  }
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