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

// --- DEFINICIÓN DEL TIPO GASTO ---
export type Gasto = {
  id: string;
  descripcion: string;
  categoria: string;
  microbus: string;
  monto: number;
  fecha: string; // Formato YYYY-MM-DD
  estado: "activo" | "inactivo" | "eliminado";
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

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("activo"); // Filtro por defecto
  const { toast } = useToast()

  // --- Cargar Gastos desde la API ---
  useEffect(() => {
    const fetchGastos = async () => {
      setLoading(true);
      try {
        // Pedimos al backend solo los gastos del estado seleccionado
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gastos?estado=${estadoFilter}`);
        if (!response.ok) {
          throw new Error("No se pudieron cargar los gastos");
        }
        const data: Gasto[] = await response.json();
        setGastos(data);
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchGastos();
  }, [toast, estadoFilter]); // Se vuelve a cargar si cambia el filtro de estado

  // --- Filtrar por Búsqueda (los gastos ya están filtrados por estado desde el API) ---
  const filteredGastos = useMemo(() => {
    return gastos.filter(
      (gasto) =>
        gasto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (gasto.microbus && gasto.microbus.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [gastos, searchTerm]);

  // --- Cálculos ---
  // (Usamos los gastos filtrados por estado ('activo' o 'inactivo') para los cálculos)
  const totalGastado = gastos.reduce((sum, g) => sum + g.monto, 0)
  
  const hoy = new Date()
  const mesActual = hoy.getFullYear() + "-" + String(hoy.getMonth() + 1).padStart(2, "0")
  const gastoDelMes = gastos
    .filter((g) => g.fecha.startsWith(mesActual))
    .reduce((sum, g) => sum + g.monto, 0)

  const gastoMicrobusA = gastos
    .filter((g) => g.microbus && g.microbus.includes('01'))
    .reduce((sum, g) => sum + g.monto, 0)
  
  const gastoMicrobusB = gastos
    .filter((g) => g.microbus && g.microbus.includes('02'))
    .reduce((sum, g) => sum + g.monto, 0)

  // --- Helpers de UI (colores de badges) ---
  const getBadgeVariant = (categoria: string) => {
    switch (categoria) {
      case "combustible": return "destructive"
      case "mantenimiento": return "secondary"
      case "salarios": return "outline"
      default: return "default"
    }
  }

  // --- Lógica de Acciones (Conectada a la API) ---
  const cambiarEstadoGasto = async (id: string, nuevoEstado: "activo" | "inactivo" | "eliminado") => {
    const gasto = gastos.find(g => g.id === id);
    if (!gasto) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gastos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }), // Enviamos solo el cambio de estado
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado del gasto");
      }
      
      // Si fue exitoso, actualizamos la UI localmente
      setGastos(prevGastos => prevGastos.filter(g => g.id !== id)); // Quitamos el gasto de la lista actual

      let mensaje = "";
      if (nuevoEstado === "eliminado") mensaje = "Gasto eliminado correctamente";
      if (nuevoEstado === "inactivo") mensaje = "Gasto desactivado correctamente";
      if (nuevoEstado === "activo") mensaje = "Gasto activado correctamente";

      toast({
        title: "Estado actualizado",
        description: `${mensaje}: ${gasto?.descripcion}`,
      });

    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }
  
  // --- Borrado Físico (Opcional, si prefieres borrado real) ---
  // const handleHardDelete = async (id: string) => {
  //   if (!window.confirm("¿BORRAR PERMANENTEMENTE? Esta acción no se puede deshacer.")) return;
  //   try {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gastos/${id}`, {
  //       method: 'DELETE',
  //     });
  //     if (!response.ok) throw new Error("No se pudo eliminar el gasto.");
  //     setGastos(prev => prev.filter((g) => g.id !== id));
  //     toast({ title: "Gasto Eliminado", description: "El gasto ha sido eliminado permanentemente." });
  //   } catch (err: any) {
  //     toast({ title: "Error al eliminar", description: err.message, variant: "destructive" });
  //   }
  // }


  return (
    <DashboardLayout title="Gestión de Gastos" menuItems={menuItems}>
      <div className="space-y-6">

        {/* --- TARJETAS 2x2 --- */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">
                Gasto Total ({estadoFilter === 'activo' ? 'Activos' : 'Inactivos'})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-red-600">${totalGastado.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Gasto de este Mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-orange-600">${gastoDelMes.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Gasto Microbús 01</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-blue-600">${gastoMicrobusA.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Gasto Microbús 02</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-600">${gastoMicrobusB.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* --- BOTÓN Y BUSCADOR --- */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
          <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descripción, categoría..."
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
          <Link href="/dashboard/propietario/gastos/nuevo" className="w-full sm:w-auto">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Gasto
            </Button>
          </Link>
        </div>

        {/* --- TABLA --- */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Gastos ({estadoFilter === 'activo' ? 'Activos' : 'Inactivos'})</CardTitle>
            <CardDescription>Registro de todos los gastos operativos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Microbús</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">Cargando...</TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredGastos.length === 0 && (
                     <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">No se encontraron gastos.</TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredGastos.map((gasto) => (
                    <TableRow key={gasto.id}>
                      <TableCell className="font-medium whitespace-nowrap">{gasto.descripcion}</TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(gasto.categoria)}>
                          {gasto.categoria.charAt(0).toUpperCase() + gasto.categoria.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{gasto.microbus || "N/A"}</TableCell>
                      <TableCell className="whitespace-nowrap">${gasto.monto.toLocaleString()}</TableCell>
                      <TableCell className="whitespace-nowrap">{new Date(gasto.fecha + "T00:00:00").toLocaleDateString('es-NI')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/propietario/gastos/editar/${gasto.id}`}>
                            <Button variant="ghost" size="icon" title="Editar">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {gasto.estado === "activo" ? (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Desactivar"
                              onClick={() => cambiarEstadoGasto(gasto.id, "inactivo")}
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Activar"
                              onClick={() => cambiarEstadoGasto(gasto.id, "activo")}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="Eliminar (Mover a Papelera)"
                            onClick={() => cambiarEstadoGasto(gasto.id, "eliminado")}
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