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

// --- TIPO GASTO (ACTUALIZADO) ---
export type Gasto = {
  id: string;
  descripcion: string;
  categoria: string;
  monto: number;
  fecha: string; 
  estado: "activo" | "inactivo" | "eliminado";
  vehiculoId: string | null;
  vehiculo?: { 
    id: string;
    nombre: string;
  }
  personalId: string | null;
  personal?: {
    id: string;
    nombre: string;
  }
};

// --- TIPO VEHÍCULO (PARA EL FILTRO) ---
type Vehiculo = {
  id: string;
  nombre: string;
};

// --- Menú (El mismo de siempre) ---
const menuItems: MenuItem[] = [
  // ... (tu menú)
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

// --- CONSTANTES PARA FILTROS ---
const CATEGORIAS_FILTRO = ["combustible", "mantenimiento", "salarios", "otros"];
const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]) // <-- AÑADIDO
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("activo"); 
  const [categoriaFilter, setCategoriaFilter] = useState("combustible"); // <-- AÑADIDO
  const [vehiculoFilter, setVehiculoFilter] = useState("todos"); // <-- AÑADIDO
  const { toast } = useToast()

  // --- Cargar Gastos y Vehículos ---
  useEffect(() => {
    const fetchDatos = async () => {
      setLoading(true);
      try {
        // Ahora cargamos Gastos y Vehículos
        const [gastosRes, vehiculosRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/gastos?estado=${estadoFilter}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos?estado=activo`)
        ]);
        
        if (!gastosRes.ok) throw new Error("No se pudieron cargar los gastos");
        if (!vehiculosRes.ok) throw new Error("No se pudieron cargar los vehículos");
        
        const dataGastos: Gasto[] = await gastosRes.json();
        const dataVehiculos: Vehiculo[] = await vehiculosRes.json();
        
        setGastos(dataGastos);
        setVehiculos(dataVehiculos); // <-- Establecer vehículos
      } catch (err: any) {
        toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, [toast, estadoFilter]); 

  // --- Filtrar por Búsqueda (para la tabla) ---
  const filteredGastos = useMemo(() => {
    return gastos.filter(
      (gasto) =>
        gasto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gasto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (gasto.vehiculo && gasto.vehiculo.nombre.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (gasto.personal && gasto.personal.nombre.toLowerCase().includes(searchTerm.toLowerCase())) 
    );
  }, [gastos, searchTerm]);

  // --- Cálculos para Tarjetas ---
  const totalGastado = gastos.reduce((sum, g) => sum + (g.monto || 0), 0)
  
  const hoy = new Date()
  const mesActual = hoy.getFullYear() + "-" + String(hoy.getMonth() + 1).padStart(2, "0")
  const gastoDelMes = gastos
    .filter((g) => g.fecha.startsWith(mesActual))
    .reduce((sum, g) => sum + (g.monto || 0), 0)

  // --- LÓGICA DE GASTO POR CATEGORÍA ---
  const gastoPorCategoria = useMemo(() => {
    const gastosFiltrados = gastos.filter(g => g.categoria === categoriaFilter);
    return gastosFiltrados.reduce((sum, g) => sum + (g.monto || 0), 0);
  }, [gastos, categoriaFilter]);

  const gastoCategoriaTitle = useMemo(() => {
    return `Total - ${capitalizar(categoriaFilter)}`;
  }, [categoriaFilter]);

  // --- LÓGICA DE GASTO POR VEHÍCULO ---
  const gastoPorVehiculo = useMemo(() => {
    let gastosFiltrados = gastos;
    if (vehiculoFilter !== "todos") {
      gastosFiltrados = gastosFiltrados.filter(g => g.vehiculoId === vehiculoFilter);
    } else {
      gastosFiltrados = gastosFiltrados.filter(g => !!g.vehiculoId);
    }
    return gastosFiltrados.reduce((sum, g) => sum + (g.monto || 0), 0);
  }, [gastos, vehiculoFilter]);

  const gastoVehiculoTitle = useMemo(() => {
    if (vehiculoFilter === "todos") {
      return "Gasto Total (Vehículos)";
    }
    const vehiculo = vehiculos.find(v => v.id === vehiculoFilter);
    return `Gasto - ${vehiculo?.nombre || 'Vehículo'}`;
  }, [vehiculoFilter, vehiculos]);
  // --- FIN CÁLCULOS ---


  const getBadgeVariant = (categoria: string) => {
    switch (categoria) {
      case "combustible": return "destructive"
      case "mantenimiento": return "secondary"
      case "salarios": return "outline"
      default: return "default"
    }
  }

  const cambiarEstadoGasto = async (id: string, nuevoEstado: "activo" | "inactivo" | "eliminado") => {
    const gasto = gastos.find(g => g.id === id);
    if (!gasto) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gastos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }), 
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado del gasto");
      }
      
      setGastos(prevGastos => prevGastos.filter(g => g.id !== id)); 

      let mensaje = "";
      if (nuevoEstado === "eliminado") mensaje = "Gasto eliminado correctamente";
      if (nuevoEstado === "inactivo") mensaje = "Gasto desactivado correctamente";
      if (nuevoEstado === "activo") mensaje = "Gasto activado correctamente";

      toast({
        title: "Estado actualizado",
        description: `${mensaje}: ${gasto?.descripcion}`,
      });

    } catch (err: any) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  }
  
  return (
    <DashboardLayout title="Gestión de Gastos" menuItems={menuItems}>
      <div className="space-y-6">

        {/* --- TARJETAS (AHORA 4 COLUMNAS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">
                Gasto Total ({estadoFilter === 'activo' ? 'Activos' : 'Inactivos'})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-red-600">C${totalGastado.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">Gasto de este Mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-orange-600">C${gastoDelMes.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          {/* --- TARJETA DINÁMICA DE GASTO POR CATEGORÍA --- */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">{gastoCategoriaTitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-blue-600">C${gastoPorCategoria.toLocaleString()}</div>
            </CardContent>
          </Card>

          {/* --- TARJETA DINÁMICA DE GASTO POR VEHÍCULO --- */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">{gastoVehiculoTitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-purple-600">C${gastoPorVehiculo.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

         <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
          <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full"> {/* <-- gap-2 para acomodar filtros */}
            <div className="relative w-full sm:max-w-xs"> {/* <-- max-w-xs */}
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
             <Select onValueChange={setEstadoFilter} value={estadoFilter}>
              <SelectTrigger className="w-full sm:w-[160px]"> {/* <-- w-[160px] */}
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>

            {/* --- FILTRO DE CATEGORÍA --- */}
            <Select onValueChange={setCategoriaFilter} value={categoriaFilter}>
              <SelectTrigger className="w-full sm:w-[180px]"> {/* <-- w-[180px] */}
                <SelectValue placeholder="Gasto por categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS_FILTRO.map(c => (
                  <SelectItem key={c} value={c}>{capitalizar(c)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* --- FILTRO DE VEHÍCULO --- */}
            <Select onValueChange={setVehiculoFilter} value={vehiculoFilter}>
              <SelectTrigger className="w-full sm:w-[180px]"> {/* <-- w-[180px] */}
                <SelectValue placeholder="Gasto por vehículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Total (Solo Vehículos)</SelectItem>
                {vehiculos.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>
                ))}
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
                    <TableHead>Vehículo</TableHead> 
                    <TableHead>Personal</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead> 
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">Cargando...</TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredGastos.length === 0 && (
                     <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">No se encontraron gastos.</TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredGastos.map((gasto) => (
                    <TableRow key={gasto.id}>
                      <TableCell className="font-medium whitespace-nowrap">{gasto.descripcion}</TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(gasto.categoria)}>
                          {capitalizar(gasto.categoria)}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{gasto.vehiculo?.nombre || "N/A"}</TableCell>
                      <TableCell className="whitespace-nowrap">{gasto.personal?.nombre || "N/A"}</TableCell>
                      <TableCell className="whitespace-nowrap">C${formatCurrency(gasto.monto)}</TableCell>
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