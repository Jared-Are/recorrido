"use client"

import { useState, useMemo, useEffect } from "react"
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
    Plus, 
    Search, 
    Users, 
    DollarSign, 
    Bus, 
    UserCog, 
    Bell, 
    BarChart3, 
    TrendingDown, 
    Pencil, 
    Trash2, 
    Eye, 
    EyeOff 
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// --- TIPO PERSONAL (ACTUALIZADO) ---
export type Personal = {
  id: string;
  nombre: string;
  puesto: string;
  contacto: string;
  salario: number;
  fechaContratacion: string; 
  estado: "activo" | "inactivo" | "eliminado";
  // --- CAMBIO AQUÍ ---
  vehiculoId: string | null;
  vehiculo?: { // El objeto 'vehiculo' ahora viene cargado (eager)
    id: string;
    nombre: string;
  }
};

// --- Menú (El mismo de siempre) ---
const menuItems: MenuItem[] = [
  { title: "Gestionar Alumnos", description: "Ver y administrar estudiantes", icon: Users, href: "/dashboard/propietario/alumnos", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
  { title: "Gestionar Pagos", description: "Ver historial y registrar pagos", icon: DollarSign, href: "/dashboard/propietario/pagos", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-900/20" },
  { title: "Gestionar Gastos", description: "Control de combustible, salarios, etc.", icon: TrendingDown, href: "/dashboard/propietario/gastos", color: "text-pink-600", bgColor: "bg-pink-50 dark:bg-pink-900/20" },
  { title: "Gestionar Personal", description: "Administrar empleados y choferes", icon: Users, href: "/dashboard/propietario/personal", color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-900/20" },
  { title: "Gestionar Vehículos", description: "Administrar flota de vehículos", icon: Bus, href: "/dashboard/propietario/vehiculos", color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
  { title: "Gestionar Usuarios", description: "Administrar accesos al sistema", icon: UserCog, href: "/dashboard/propietario/usuarios", color: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-900/20" },
  { title: "Enviar Avisos", description: "Comunicados a tutores y personal", icon: Bell, href: "/dashboard/propietario/avisos", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-900/20" },
  { title: "Generar Reportes", description: "Estadísticas y análisis", icon: BarChart3, href: "/dashboard/propietario/reportes", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-900/20" },
]

// Helper de formato de moneda
const formatCurrency = (num: number) => {
  return (num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PersonalPage() {
  const [personal, setPersonal] = useState<Personal[]>([])
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("activo"); 
  const { toast } = useToast()

  // --- Cargar Personal desde la API ---
  useEffect(() => {
    const fetchPersonal = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/personal?estado=${estadoFilter}`);
        if (!response.ok) {
          throw new Error("No se pudo cargar la lista de personal");
        }
        const data: Personal[] = await response.json();
        setPersonal(data);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchPersonal();
  }, [toast, estadoFilter]); 

  // --- Filtrar por Búsqueda ---
  const filteredPersonal = useMemo(() => {
    return personal.filter(
      (p) =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.puesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.vehiculo && p.vehiculo.nombre.toLowerCase().includes(searchTerm.toLowerCase())) // <-- CAMBIADO
    );
  }, [personal, searchTerm]);

  // --- Cálculos ---
  const totalPersonal = personal.length;
  const totalSalarios = personal.reduce((sum, p) => sum + (p.salario || 0), 0);

  // --- Lógica de Acciones (Conectada a la API) ---
  const cambiarEstadoPersonal = async (id: string, nuevoEstado: "activo" | "inactivo" | "eliminado") => {
    const empleado = personal.find(p => p.id === id);
    if (!empleado) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/personal/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }), 
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado del empleado");
      }
      
      setPersonal(prevPersonal => prevPersonal.filter(p => p.id !== id)); 

      let mensaje = "";
      if (nuevoEstado === "eliminado") mensaje = "Empleado eliminado correctamente";
      if (nuevoEstado === "inactivo") mensaje = "Empleado desactivado correctamente";
      if (nuevoEstado === "activo") mensaje = "Empleado activado correctamente";

      toast({
        title: "Estado actualizado",
        description: `${mensaje}: ${empleado?.nombre}`,
      });

    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }
  
  return (
    <DashboardLayout title="Gestión de Personal" menuItems={menuItems}>
      <div className="space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">
                Total Personal ({estadoFilter === 'activo' ? 'Activos' : 'Inactivos'})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{totalPersonal}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Total Salarios (Mensual)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-600">C${formatCurrency(totalSalarios)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
          <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, puesto, vehículo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
             <Select onValueChange={setEstadoFilter} value={estadoFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/dashboard/propietario/personal/nuevo" className="w-full sm:w-auto">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Personal
            </Button>
          </Link>
        </div>

        {/* --- TABLA (CORREGIDA) --- */}
        <Card>
          <CardHeader>
            <CardTitle>Personal ({estadoFilter === 'activo' ? 'Activos' : 'Inactivos'})</CardTitle>
            <CardDescription>Lista de todo el personal de la empresa.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                
                {/* ======================= INICIO DE LA CORRECCIÓN ======================= */}
                {/* Se eliminó el espacio en blanco (salto de línea) entre <TableRow> 
                   y el primer <TableHead> para evitar el error de hidratación.
                */}
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Puesto</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Salario</TableHead>
                    <TableHead>Vehículo Asignado</TableHead>
                    <TableHead>Contratación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                {/* ======================== FIN DE LA CORRECCIÓN ========================= */}

                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">Cargando...</TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredPersonal.length === 0 && (
                     <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">No se encontró personal.</TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredPersonal.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium whitespace-nowrap">{p.nombre}</TableCell>
                      <TableCell>
                        <Badge variant={p.puesto === 'Chofer' ? 'default' : 'secondary'}>
                          {p.puesto}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{p.contacto || "N/A"}</TableCell>
                      <TableCell className="whitespace-nowrap">C${formatCurrency(p.salario)}</TableCell>
                      {/* --- CAMBIO AQUÍ: Muestra el nombre del vehículo --- */}
                      <TableCell className="whitespace-nowrap">{p.vehiculo?.nombre || "N/A"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {p.fechaContratacion ? new Date(p.fechaContratacion + "T00:00:00").toLocaleDateString('es-NI') : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/propietario/personal/${p.id}`}>
                            <Button variant="ghost" size="icon" title="Editar">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {p.estado === "activo" ? (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Desactivar"
                              onClick={() => cambiarEstadoPersonal(p.id, "inactivo")}
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Activar"
                              onClick={() => cambiarEstadoPersonal(p.id, "activo")}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="Eliminar (Mover a Papelera)"
                            onClick={() => cambiarEstadoPersonal(p.id, "eliminado")}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}