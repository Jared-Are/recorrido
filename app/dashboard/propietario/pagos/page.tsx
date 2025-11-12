"use client"

import { useState, useMemo, useEffect } from "react"
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Importar Select
import { 
    Plus, 
    Search, 
    Pencil,  // Importar Pencil
    Trash2,  // Importar Trash2
    Users, 
    DollarSign, 
    Bus, 
    UserCog, 
    Bell, 
    BarChart3, 
    TrendingDown 
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

// --- DEFINICIÓN DEL TIPO PAGO (DESDE LA BD) ---
export type Pago = {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  monto: number;
  mes: string;
  fecha: string; // Formato YYYY-MM-DD
  estado: "pagado" | "pendiente";
};

// --- DEFINICIÓN DEL MENÚ (Copiado de tus archivos) ---
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
  // ... (el resto de tu menú) ...
];


export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]) // Inicia vacío
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos"); // Filtro para 'pagado' o 'pendiente'

  // --- OBTENER DATOS DE LA API ---
  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pagos`);
        if (!response.ok) {
          throw new Error('No se pudieron cargar los pagos');
        }
        const data: Pago[] = await response.json();
        setPagos(data);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error al cargar datos",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPagos();
  }, [toast]);

  // --- LÓGICA DE FILTRADO (Usa el 'pagos' del estado) ---
  const filteredPagos = useMemo(() => {
    let pagosFiltrados = [...pagos];
    if (statusFilter !== "todos") {
      pagosFiltrados = pagosFiltrados.filter(p => p.estado === statusFilter);
    }
    if (searchTerm) {
      pagosFiltrados = pagosFiltrados.filter(
        (pago) =>
          pago.alumnoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pago.mes.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    pagosFiltrados.sort((a, b) => (a.fecha > b.fecha ? -1 : 1));
    return pagosFiltrados;
  }, [pagos, searchTerm, statusFilter]);

  // --- CÁLCULOS (Usan el 'pagos' del estado) ---
  const totalPagado = useMemo(() => 
    pagos.filter((p) => p.estado === "pagado").reduce((sum, p) => sum + p.monto, 0),
  [pagos]);
  
  const totalPendiente = useMemo(() =>
    pagos.filter((p) => p.estado === "pendiente").reduce((sum, p) => sum + p.monto, 0),
  [pagos]);

  // --- BORRAR PAGO CON API ---
  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de ELIMINAR este registro de pago? Esta acción es permanente.")) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pagos/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error("No se pudo eliminar el pago.");
        }
        setPagos(prev => prev.filter((p) => p.id !== id));
        toast({
          title: "Pago Eliminado",
          description: "El registro del pago ha sido eliminado.",
        });
      } catch (err: any) {
        toast({
          title: "Error al eliminar",
          description: err.message,
          variant: "destructive",
        });
      }
    }
  };

  // --- MANEJO DE ESTADOS DE CARGA/ERROR ---
  if (loading) {
    return (
      <DashboardLayout title="Gestión de Pagos" menuItems={menuItems}>
        <div className="flex justify-center items-center h-64"><p>Cargando pagos...</p></div>
      </DashboardLayout>
    );
  }
  if (error) {
    return (
      <DashboardLayout title="Gestión de Pagos" menuItems={menuItems}>
        <div className="flex justify-center items-center h-64"><p className="text-destructive">Error: {error}</p></div>
      </DashboardLayout>
    );
  }

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <DashboardLayout title="Gestión de Pagos" menuItems={menuItems}>
      <div className="space-y-6">
        {/* --- TARJETAS DE RESUMEN (De tu código) --- */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardDescription className="text-xs">Total Pagado</CardDescription></CardHeader>
            <CardContent><div className="text-xl md:text-2xl font-bold text-green-600">C${totalPagado.toLocaleString()}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription className="text-xs">Total Pendiente</CardDescription></CardHeader>
            <CardContent><div className="text-xl md:text-2xl font-bold text-orange-600">C${totalPendiente.toLocaleString()}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription className="text-xs">Total Registros</CardDescription></CardHeader>
            <CardContent><div className="text-xl md:text-2xl font-bold">{pagos.length}</div></CardContent>
          </Card>
        </div>

        {/* --- CONTROLES DE BÚSQUEDA Y ACCIÓN --- */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
          <div className="flex-1 flex gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por alumno o mes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <Select onValueChange={setStatusFilter} defaultValue="todos">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pagado">Pagado</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link href="/dashboard/propietario/pagos/nuevo" className="w-full sm:w-auto">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Pago
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Pagos</CardTitle>
            <CardDescription>Registro de pagos mensuales de todos los alumnos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumno</TableHead>
                    <TableHead>Mes</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha de Pago</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead> {/* <-- AÑADIDO */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPagos.map((pago) => (
                    <TableRow key={pago.id}>
                      <TableCell className="font-medium">{pago.alumnoNombre}</TableCell>
                      <TableCell>{pago.mes}</TableCell>
                      <TableCell>C${pago.monto.toLocaleString()}</TableCell>
                      <TableCell>{pago.fecha ? new Date(pago.fecha).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>
                        <Badge variant={pago.estado === "pagado" ? "default" : "secondary"}>
                          {pago.estado === "pagado" ? "Pagado" : "Pendiente"}
                        </Badge>
                      </TableCell>
                      {/* --- CELDAS DE ACCIÓN AÑADIDAS --- */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/propietario/pagos/${pago.id}`}>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(pago.id)}>
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