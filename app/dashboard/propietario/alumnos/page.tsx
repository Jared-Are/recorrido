"use client"

import { useState, useMemo } from "react"
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
import { mockAlumnos, type Alumno } from "@/lib/mock-data"

// --- DEFINICIÓN DEL MENÚ PARA QUE EL LAYOUT FUNCIONE ---
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
  const [alumnos, setAlumnos] = useState<Alumno[]>(mockAlumnos)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecorrido, setSelectedRecorrido] = useState("todos")
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const filteredAlumnos = useMemo(() => {
    let alumnosFiltrados = [...alumnos];

    if (selectedRecorrido !== "todos") {
      alumnosFiltrados = alumnosFiltrados.filter(a => a.recorridoId === selectedRecorrido);
    } else {
      alumnosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    
    if (searchTerm) {
      alumnosFiltrados = alumnosFiltrados.filter(
        (alumno) =>
          alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alumno.tutor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alumno.direccion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return alumnosFiltrados;
  }, [alumnos, searchTerm, selectedRecorrido]);

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este alumno?")) {
      setAlumnos(prev => prev.filter((a) => a.id !== id));
    }
  };

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

    const draggedItem = filteredAlumnos[draggedIndex];
    const newAlumnosList = [...alumnos];
    const originalDraggedIndex = newAlumnosList.findIndex(a => a.id === draggedItem.id);
    const [removed] = newAlumnosList.splice(originalDraggedIndex, 1);
    const originalTargetIndex = newAlumnosList.findIndex(a => a.id === filteredAlumnos[targetIndex].id);
    newAlumnosList.splice(originalTargetIndex, 0, removed);
    
    setAlumnos(newAlumnosList);
    setDraggedIndex(null);
  };

  const cardInfo = useMemo(() => {
    if (selectedRecorrido === 'recorridoA') {
      return { title: 'Total en Recorrido A', description: `Capacidad: ${filteredAlumnos.length} / 30` };
    }
    if (selectedRecorrido === 'recorridoB') {
      return { title: 'Total en Recorrido B', description: `Capacidad: ${filteredAlumnos.length} / 20` };
    }
    return { title: 'Total de Alumnos', description: 'Todos los recorridos combinados' };
  }, [selectedRecorrido, filteredAlumnos.length, alumnos.length]);

  return (
    <DashboardLayout title="Gestión de Alumnos" menuItems={menuItems}>
      <div className="space-y-6">
        {/* --- CONTENEDOR DE CONTROLES ACTUALIZADO --- */}
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">

            {/* Grupo de Filtro y Tarjeta */}
            <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
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
                <Card className="w-full md:w-[240px] flex-shrink-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{cardInfo.title}</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedRecorrido === 'todos' ? alumnos.length : filteredAlumnos.length}</div>
                      <p className="text-xs text-muted-foreground">{cardInfo.description}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Grupo de Búsqueda y Botones (con orden invertido en móvil) */}
            <div className="flex flex-col-reverse md:flex-row gap-4 w-full lg:w-auto lg:flex-1 lg:justify-end">
                <div className="relative flex-1 lg:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar alumno..."
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
                    <TableHead>Dirección</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlumnos.map((alumno, index) => (
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
                      <TableCell>{alumno.direccion}</TableCell>
                      <TableCell>{alumno.grado}</TableCell>
                      <TableCell>${alumno.precio?.toLocaleString() ?? 'N/A'}</TableCell>
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