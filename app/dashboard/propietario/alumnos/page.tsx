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
    Replace, 
    GripVertical, 
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

// --- DEFINICIÓN DEL TIPO ALUMNO (DESDE LA BD) ---
export type Alumno = {
  id: string;
  nombre: string;
  tutor: string;
  grado: string;
  contacto: string;
  activo: boolean;
  precio?: number;
  direccion: string;
  recorridoId: string;
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


export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecorrido, setSelectedRecorrido] = useState("todos")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [sortOption, setSortOption] = useState("grado-asc");


  // --- OBTENER DATOS DE LA API ---
  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos`);
        if (!response.ok) {
          throw new Error('No se pudieron cargar los alumnos');
        }
        const data: Alumno[] = await response.json();
        setAlumnos(data);
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
    fetchAlumnos();
  }, [toast]);

  // --- LÓGICA DE FILTRADO Y ORDEN ---
  const filteredAndSortedAlumnos = useMemo(() => {
    
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

    // 1. Filtrar por Recorrido
    if (selectedRecorrido !== "todos") {
      alumnosFiltrados = alumnosFiltrados.filter(a => a.recorridoId === selectedRecorrido);
    }
    
    // 2. Filtrar por Término de Búsqueda
    if (searchTerm) {
      alumnosFiltrados = alumnosFiltrados.filter(
        (alumno) =>
          alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alumno.tutor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alumno.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (alumno.direccion && alumno.direccion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 3. Aplicar Orden
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
  }, [alumnos, searchTerm, selectedRecorrido, sortOption]);

  // --- BORRAR ALUMNO CON API ---
  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este alumno? (Borrado lógico)")) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error("No se pudo eliminar el alumno.");
        }

        setAlumnos(prev => prev.filter((a) => a.id !== id));
        toast({
          title: "Alumno Eliminado",
          description: "El alumno se ha marcado como inactivo.",
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

  // --- Lógica de Arrastrar y Soltar ---
  const handleInvertirOrden = () => {
    if (selectedRecorrido === 'todos') return;
    const alumnosDelRecorrido = alumnos.filter(a => a.recorridoId === selectedRecorrido).reverse();
    const otrosAlumnos = alumnos.filter(a => a.recorridoId !== selectedRecorrido);
    setAlumnos([...alumnosDelRecorrido, ...otrosAlumnos]);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null) return;
    const draggedItem = filteredAndSortedAlumnos[draggedIndex];
    const newAlumnosList = [...alumnos];
    const originalDraggedIndex = newAlumnosList.findIndex(a => a.id === draggedItem.id);
    const [removed] = newAlumnosList.splice(originalDraggedIndex, 1);
    const originalTargetIndex = newAlumnosList.findIndex(a => a.id === filteredAndSortedAlumnos[targetIndex].id);
    newAlumnosList.splice(originalTargetIndex, 0, removed);
    setAlumnos(newAlumnosList);
    setDraggedIndex(null);
  };

  // ===== CORRECCIÓN AQUÍ: LÓGICA DE cardInfo AÑADIDA =====
  const cardInfo = useMemo(() => {
    if (selectedRecorrido === 'recorridoA') {
      return { title: 'Total en Recorrido A', description: `Capacidad: ${filteredAndSortedAlumnos.length} / 30` };
    }
    if (selectedRecorrido === 'recorridoB') {
      return { title: 'Total en Recorrido B', description: `Capacidad: ${filteredAndSortedAlumnos.length} / 20` };
    }
    // Usamos 'alumnos.length' para el total general, no la lista filtrada
    return { title: 'Total de Alumnos', description: 'Todos los recorridos combinados' };
  }, [selectedRecorrido, filteredAndSortedAlumnos.length, alumnos.length]); // <-- Dependencias correctas


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

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <DashboardLayout title="Gestión de Alumnos" menuItems={menuItems}>
      <div className="space-y-6">
        {/* --- CONTENEDOR DE CONTROLES --- */}
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">

            {/* Grupo de Filtro y Tarjeta */}
            <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
                {/* Filtro de Recorrido */}
                <Select onValueChange={setSelectedRecorrido} defaultValue="todos">
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrar por recorrido" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los Recorridos</SelectItem>
                    <SelectItem value="recorridoA">Recorrido A</SelectItem>
                    <SelectItem value="recorridoB">Recorrido B</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtro de Orden */}
                <Select onValueChange={setSortOption} defaultValue="grado-asc">
                  <SelectTrigger className="w-full md:w-[190px]">
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
                </Select> {/* ===== CORRECCIÓN AQUÍ: </Select> en lugar de </S> ===== */}
            </div>

            {/* Grupo de Tarjeta de Info */}
            <div className="flex-shrink-0">
                <Card className="w-full md:w-[240px]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{cardInfo.title}</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedRecorrido === 'todos' ? alumnos.length : filteredAndSortedAlumnos.length}</div>
                      <p className="text-xs text-muted-foreground">{cardInfo.description}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Grupo de Búsqueda y Botones */}
            <div className="flex flex-col-reverse md:flex-row gap-4 w-full lg:w-auto lg:flex-1 lg:justify-end">
                <div className="relative flex-1 lg:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar alumno, tutor, contacto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={handleInvertirOrden}
                      className={selectedRecorrido === 'todos' ? 'hidden' : ''}
                    >
                      <Replace className="h-4 w-4 mr-2" />
                      Invertir Orden
                    </Button>
                    <Link href="/dashboard/propietario/alumnos/nuevo">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Alumno
                      </Button>
                    </Link>
                </div>
            </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Alumnos</CardTitle>
            <CardDescription>
              {selectedRecorrido !== 'todos' 
                ? 'Arrastra y suelta los alumnos para definir el orden de recogida.'
                : 'Gestiona los estudiantes registrados en el sistema.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectedRecorrido !== 'todos' && <TableHead className="w-12"></TableHead>}
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedAlumnos.map((alumno, index) => (
                    <TableRow 
                      key={alumno.id}
                      draggable={selectedRecorrido !== 'todos'}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                      className={draggedIndex === index ? 'bg-muted' : ''}
                    >
                      {selectedRecorrido !== 'todos' && (
                        <TableCell className="cursor-grab">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">{alumno.nombre}</TableCell>
                      <TableCell>{alumno.tutor}</TableCell>
                      <TableCell>{alumno.contacto}</TableCell>
                      <TableCell>{alumno.direccion}</TableCell>
                      <TableCell>{alumno.grado}</TableCell>
                      <TableCell>C${alumno.precio?.toLocaleString() ?? 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={alumno.activo ? "default" : "secondary"}>
                          {alumno.activo ? "Activo" : "Inactivo"} 
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/propietario/alumnos/${alumno.id}`}>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(alumno.id)}>
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