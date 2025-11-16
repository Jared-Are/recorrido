"use client"

import { useState, useMemo, useEffect } from "react"
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
    Plus, 
    Search, 
    Pencil, 
    Trash2,
    Users, 
    DollarSign, 
    Bus, 
    UserCog, 
    Bell, 
    BarChart3, 
    TrendingDown,
    Eye,
    EyeOff,
    Filter
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

// --- TIPO PARA EL VEHÍCULO CARGADO ---
type Vehiculo = {
  id: string;
  nombre: string;
  capacidad?: number;
};

// --- DEFINICIÓN DEL TIPO ALUMNO (ACTUALIZADO) ---
export type Alumno = {
  id: string;
  nombre: string;
  tutor: string;
  grado: string;
  contacto: string;
  activo: boolean;
  precio?: number;
  direccion: string;
  vehiculoId: string | null; 
  vehiculo?: Vehiculo; 
};

// --- DEFINICIÓN DEL MENÚ ---
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

// Helper de formato de moneda
const formatCurrency = (num: number) => {
  return (num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVehiculo, setSelectedVehiculo] = useState("todos") 
  const [estadoFilter, setEstadoFilter] = useState("activo"); 
  const [sortOption, setSortOption] = useState("grado-asc"); 


  // --- OBTENER DATOS DE LA API (ALUMNOS Y VEHÍCULOS) ---
  useEffect(() => {
    const fetchDatos = async () => {
      setLoading(true);
      try {
        const [alumnosRes, vehiculosRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos?estado=${estadoFilter}`), 
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos?estado=activo`)
        ]);

        if (!alumnosRes.ok) throw new Error('No se pudieron cargar los alumnos');
        if (!vehiculosRes.ok) throw new Error('No se pudieron cargar los vehículos');
        
        const alumnosData: Alumno[] = await alumnosRes.json();
        const vehiculosData: Vehiculo[] = await vehiculosRes.json();
        
        setAlumnos(alumnosData);
        setVehiculos(vehiculosData);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error al cargar datos",
          description: (err as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, [toast, estadoFilter]); 

  // --- LÓGICA DE FILTRADO Y ORDEN ---
  const filteredAlumnos = useMemo(() => { 
    
    const gradoToNumber = (grado: string) => {
      const parts = grado.split(' ');
      if (parts.length < 2) return 99;
      const numero = parseInt(parts[0], 10) || 0;
      const nivel = parts[1].toLowerCase();
      
      if (nivel.startsWith('preescolar')) return numero;
      if (nivel.startsWith('primaria')) return numero + 3;
      return 99;
    };

    let alumnosFiltrados = [...alumnos];

    // 1. Filtrar por Vehículo
    if (selectedVehiculo !== "todos") {
      alumnosFiltrados = alumnosFiltrados.filter(a => a.vehiculoId === selectedVehiculo);
    }
    
    // 2. Filtrar por Término de Búsqueda
    if (searchTerm) {
      alumnosFiltrados = alumnosFiltrados.filter(
        (alumno) =>
          alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alumno.tutor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (alumno.contacto && alumno.contacto.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (alumno.direccion && alumno.direccion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // --- 3. APLICAR ORDEN (AÑADIDO) ---
    switch (sortOption) {
      case 'grado-asc':
        alumnosFiltrados.sort((a, b) => gradoToNumber(a.grado) - gradoToNumber(b.grado));
        break;
      case 'grado-desc':
        alumnosFiltrados.sort((a, b) => gradoToNumber(b.grado) - gradoToNumber(a.grado));
        break;
      case 'nombre-asc':
        alumnosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'nombre-desc':
        alumnosFiltrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case 'tutor-asc':
        alumnosFiltrados.sort((a, b) => a.tutor.localeCompare(b.tutor));
        break;
      case 'tutor-desc':
        alumnosFiltrados.sort((a, b) => b.tutor.localeCompare(a.tutor));
        break;
      case 'precio-asc':
        alumnosFiltrados.sort((a, b) => (a.precio ?? 0) - (b.precio ?? 0));
        break;
      case 'precio-desc':
        alumnosFiltrados.sort((a, b) => (b.precio ?? 0) - (a.precio ?? 0));
        break;
      default:
        alumnosFiltrados.sort((a, b) => gradoToNumber(a.grado) - gradoToNumber(b.grado));
    }
    
    return alumnosFiltrados;
  }, [alumnos, searchTerm, selectedVehiculo, sortOption]); 

  // --- BORRADO LÓGICO (DESACTIVAR) ---
  const cambiarEstadoAlumno = async (id: string, nuevoEstado: "activo" | "inactivo") => {
    const alumno = alumnos.find(a => a.id === id);
    if (!alumno) return;

    const confirmMessage = nuevoEstado === 'inactivo' 
      ? `¿Estás seguro de DESACTIVAR a ${alumno.nombre}? (Se moverá a 'Inactivos')` 
      : `¿Estás seguro de REACTIVAR a ${alumno.nombre}? (Se moverá a 'Activos')`;
      
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: nuevoEstado === 'activo' }), 
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado del alumno");
      }
      
      setAlumnos(prev => prev.filter(a => a.id !== id)); 

      let mensaje = "";
      if (nuevoEstado === "inactivo") mensaje = "Alumno desactivado correctamente";
      if (nuevoEstado === "activo") mensaje = "Alumno activado correctamente";
      
      toast({
        title: "Estado actualizado",
        description: `${mensaje}: ${alumno?.nombre}`,
      });

    } catch (err: any) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    }
  }

  // --- BORRADO FÍSICO (ELIMINAR PERMANENTEMENTE) ---
  const handleDelete = async (id: string) => {
    const alumno = alumnos.find(a => a.id === id);
    if (!alumno) return;

    if (window.confirm(`¿Estás SEGURO de ELIMINAR PERMANENTEMENTE a ${alumno.nombre}? Esta acción no se puede deshacer.`)) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos/${id}`, {
          method: 'DELETE', // <-- BORRADO FÍSICO
        });

        if (!response.ok) {
          throw new Error("No se pudo eliminar el alumno.");
        }

        setAlumnos(prev => prev.filter((a) => a.id !== id));
        toast({
          title: "Alumno Eliminado",
          description: "El alumno ha sido eliminado permanentemente.",
        });

      } catch (err: any) {
        toast({
          title: "Error al eliminar",
          description: (err as Error).message,
          variant: "destructive",
        });
      }
    }
  };

  // --- LÓGICA DE TARJETA DE RESUMEN (ACTUALIZADA) ---
  const cardInfo = useMemo(() => {
    // La tarjeta de "Total Alumnos" ahora SIEMPRE usa la lista filtrada
    const totalAlumnos = filteredAlumnos.length;
    
    let totalCapacidad = 0;
    let descripcionCapacidad = "Capacidad Total (Activos)";

    if (selectedVehiculo === 'todos') {
      // Suma la capacidad de TODOS los vehículos activos
      totalCapacidad = vehiculos.reduce((sum, v) => sum + (v.capacidad || 0), 0);
    } else {
      // Muestra la capacidad del vehículo seleccionado
      const vehiculo = vehiculos.find(v => v.id === selectedVehiculo);
      totalCapacidad = vehiculo?.capacidad || 0;
      descripcionCapacidad = `Capacidad en ${vehiculo?.nombre || 'Vehículo'}`;
    }
    
    return { 
      totalAlumnos, 
      totalCapacidad,
      descripcionCapacidad
    };
  }, [selectedVehiculo, filteredAlumnos, vehiculos, estadoFilter]); // <-- Dependencias correctas


  // --- MANEJO DE ESTADOS DE CARGA/ERROR ---
  if (loading) {
    return (
      <DashboardLayout title="Gestión de Alumnos" menuItems={menuItems}>
        <div className="flex justify-center items-center h-64">
          <p>Cargando alumnos...</p>
        </div>
      </DashboardLayout>
    );
  }
  if (error) {
    return (
      <DashboardLayout title="Gestión de Alumnos" menuItems={menuItems}>
        <div className="flex justify-center items-center h-64">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  // --- RENDERIZADO PRINCIPAL (LAYOUT CORREGIDO) ---
  return (
    <DashboardLayout title="Gestión de Alumnos" menuItems={menuItems}>
      <div className="space-y-6">
        
        {/* --- TARJETAS DE RESUMEN (ESTILO GASTOS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">
                Total Alumnos ({estadoFilter === 'activo' ? 'Activos' : 'Inactivos'})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cardInfo.totalAlumnos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">{cardInfo.descripcionCapacidad}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{cardInfo.totalCapacidad}</div>
            </CardContent>
          </Card>
        </div>

        {/* --- CONTROLES DE BÚSQUEDA Y ACCIÓN (ESTILO GASTOS) --- */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
          {/* Lado Izquierdo: Filtros y Búsqueda */}
          <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alumno, tutor, contacto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            {/* Filtro de Vehículo */}
            <Select onValueChange={setSelectedVehiculo} defaultValue="todos">
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Filtrar por vehículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los Vehículos</SelectItem>
                {vehiculos.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro de Estado */}
            <Select onValueChange={setEstadoFilter} value={estadoFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Filtro de Orden */}
            <Select onValueChange={setSortOption} defaultValue="grado-asc">
              <SelectTrigger className="w-full sm:w-[190px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grado-asc">Grado (Ascendente)</SelectItem>
                <SelectItem value="grado-desc">Grado (Descendente)</SelectItem>
                <SelectItem value="nombre-asc">Nombre (A-Z)</SelectItem>
                <SelectItem value="nombre-desc">Nombre (Z-A)</SelectItem>
                <SelectItem value="tutor-asc">Tutor (A-Z)</SelectItem>
                <SelectItem value="tutor-desc">Tutor (Z-A)</SelectItem>
                <SelectItem value="precio-asc">Precio (Menor a Mayor)</SelectItem>
                <SelectItem value="precio-desc">Precio (Mayor a Menor)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lado Derecho: Botón de Añadir */}
          <div className="flex gap-2 justify-end w-full sm:w-auto">
            <Link href="/dashboard/propietario/alumnos/nuevo" className="w-full sm:w-auto">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Alumno
              </Button>
            </Link>
          </div>
        </div>

        {/* --- TABLA --- */}
        <Card>
          <CardHeader>
            <CardTitle>Alumnos ({estadoFilter === 'activo' ? 'Activos' : 'Inactivos'})</CardTitle>
            <CardDescription>
              Gestiona los estudiantes registrados en el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Vehículo Asignado</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">Cargando...</TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredAlumnos.length === 0 && (
                     <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">No se encontraron alumnos con esos filtros.</TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredAlumnos.map((alumno) => ( 
                    <TableRow key={alumno.id}>
                      <TableCell className="font-medium whitespace-nowrap">{alumno.nombre}</TableCell>
                      <TableCell className="whitespace-nowrap">{alumno.tutor}</TableCell>
                      <TableCell className="whitespace-nowrap">{alumno.grado}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline">{alumno.vehiculo?.nombre || "Sin asignar"}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">C${formatCurrency(alumno.precio ?? 0)}</TableCell>
                      <TableCell className="whitespace-nowrap">{alumno.contacto || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/propietario/alumnos/editar/${alumno.id}`}>
                            <Button variant="ghost" size="icon" title="Editar">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {alumno.activo ? (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Desactivar (Mover a Inactivos)"
                              onClick={() => cambiarEstadoAlumno(alumno.id, "inactivo")}
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Activar (Mover a Activos)"
                              onClick={() => cambiarEstadoAlumno(alumno.id, "activo")}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            title="Eliminar Permanentemente"
                            onClick={() => handleDelete(alumno.id)} 
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