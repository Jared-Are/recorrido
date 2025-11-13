"use client"

import { useState, useMemo, useEffect } from "react"
import React from "react"
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
    List, 
    LayoutGrid 
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

// --- DEFINICIÓN DE TIPOS ---
export type Pago = {
  id: string;
  alumnoId: string;
  alumnoNombre: string; 
  monto: number;
  mes: string;
  fecha: string; 
  estado: "pagado" | "pendiente";
};

export type Alumno = {
  id: string;
  nombre: string;
  tutor: string;
  grado: string;
  precio?: number; 
  activo: boolean; 
};


// --- DEFINICIÓN DEL MENÚ COMPLETO ---
const menuItems: MenuItem[] = [
  // ... (tu menú)
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

// --- CONSTANTES PARA LA VISTA DE CUADERNO (CORREGIDAS) ---
const ANIO_ESCOLAR = new Date().getFullYear().toString(); 
const MES_DICIEMBRE = `Diciembre ${ANIO_ESCOLAR}`; 
const MESES_CUADERNO = [
  "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
].map(mes => `${mes} ${ANIO_ESCOLAR}`);

// --- CONSTANTE PARA EL FILTRO DE TARJETAS ---
const MESES_FILTRO = ["Todos", ...MESES_CUADERNO];

const GRADO_ORDER = [
  "1° Preescolar", "2° Preescolar", "3° Preescolar",
  "1° Primaria", "2° Primaria", "3° Primaria",
  "4° Primaria", "5° Primaria", "6° Primaria"
];

const formatCurrency = (num: number) => {
  return (num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]) 
  const [alumnos, setAlumnos] = useState<Alumno[]>([]) 
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  // const [statusFilter, setStatusFilter] = useState("todos"); // <-- ELIMINADO
  
  const [cardMonthFilter, setCardMonthFilter] = useState("Todos");
  
  const [viewMode, setViewMode] = useState<'lista' | 'cuaderno'>('lista');

  // --- OBTENER DATOS DE LA API ---
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const [pagosRes, alumnosRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/pagos`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos`)
        ]);

        if (!pagosRes.ok || !alumnosRes.ok) {
          throw new Error('No se pudieron cargar todos los datos');
        }
        const pagosData: Pago[] = await pagosRes.json();
        const alumnosData: Alumno[] = await alumnosRes.json();
        
        setPagos(pagosData);
        setAlumnos(alumnosData.filter(a => a.activo)); 
      
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
    fetchDatos();
  }, [toast]);

  // --- LÓGICA DE FILTRADO (Para la 'Vista de Lista') ---
  const filteredPagos = useMemo(() => {
    let pagosFiltrados = [...pagos];

    if (cardMonthFilter !== "Todos") {
      pagosFiltrados = pagosFiltrados.filter(p => p.mes === cardMonthFilter);
    }

    // El filtro de "estado" se ha eliminado
    // if (statusFilter !== "todos") { ... }

    if (searchTerm) {
      pagosFiltrados = pagosFiltrados.filter(
        (pago) =>
          pago.alumnoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pago.mes.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    pagosFiltrados.sort((a, b) => {
      const dateA = a.fecha ? new Date(a.fecha).getTime() : 0;
      const dateB = b.fecha ? new Date(b.fecha).getTime() : 0;
      return dateB - dateA;
    });
    return pagosFiltrados;
  }, [pagos, searchTerm, cardMonthFilter]); // <-- Dependencia de statusFilter eliminada, cardMonthFilter añadida

  // --- LÓGICA DE DATOS (Para la 'Vista de Cuaderno') ---
  const cuadernoData = useMemo(() => {
    
    const pagosMap = new Map<string, Map<string, { 
      fechaSimple: string | null, 
      abonos: { fecha: string, monto: number }[],
      totalAbonado: number, 
    }>>();

    for (const pago of pagos) {
      if (pago.estado !== 'pagado' || !pago.fecha) continue;

      if (!pagosMap.has(pago.alumnoId)) {
        pagosMap.set(pago.alumnoId, new Map());
      }
      
      const fechaParts = pago.fecha.split('-'); 
      const fechaFormateada = `${fechaParts[2]}/${fechaParts[1]}`; 

      if (!pagosMap.get(pago.alumnoId)!.has(pago.mes)) {
         pagosMap.get(pago.alumnoId)!.set(pago.mes, { 
           fechaSimple: null, 
           abonos: [], 
           totalAbonado: 0 
         });
      }

      const mesData = pagosMap.get(pago.alumnoId)!.get(pago.mes)!;

      if (pago.mes === MES_DICIEMBRE) {
        mesData.abonos.push({ fecha: fechaFormateada, monto: pago.monto });
        mesData.totalAbonado += pago.monto; 
      } else {
        mesData.fechaSimple = fechaFormateada;
      }
    }

    let data = alumnos.map(alumno => {
      const pagosDelAlumno = pagosMap.get(alumno.id) || new Map();
      return {
        ...alumno, 
        meses: MESES_CUADERNO.map(mes => {
          const mesData = pagosDelAlumno.get(mes) || { fechaSimple: null, abonos: [], totalAbonado: 0 };
          const precio = alumno.precio || 0;

          let esDiciembrePagado = false;
          if (mes === MES_DICIEMBRE) {
            esDiciembrePagado = mesData.totalAbonado >= (precio - 0.01);
          }

          return {
            mes: mes, 
            ...mesData,
            esDiciembrePagado, // <-- AHORA SOLO INDICA SI ESTÁ PAGADO O NO
          };
        })
      };
    });

    data = data.filter(a => a.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const grouped = data.reduce((acc, alumno) => {
      const grado = alumno.grado || "Sin Grado"; 
      if (!acc[grado]) {
        acc[grado] = [];
      }
      acc[grado].push(alumno);
      return acc;
    }, {} as Record<string, typeof data>); 

    const sortedGroupKeys = Object.keys(grouped).sort((a, b) => {
      const indexA = GRADO_ORDER.indexOf(a);
      const indexB = GRADO_ORDER.indexOf(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    return { grouped, sortedGroupKeys }; 

  }, [alumnos, pagos, searchTerm]); 


  // --- CÁLCULOS (MODIFICADOS PARA FILTRO DE TARJETAS) ---
  const pagosParaTarjetas = useMemo(() => {
    if (cardMonthFilter === "Todos") {
      return pagos;
    }
    return pagos.filter(p => p.mes === cardMonthFilter);
  }, [pagos, cardMonthFilter]);

  const totalPagado = useMemo(() => 
    pagosParaTarjetas.filter((p) => p.estado === "pagado").reduce((sum, p) => sum + p.monto, 0),
  [pagosParaTarjetas]);
  
  // --- LÓGICA DE "PENDIENTE" CORREGIDA ---
  const totalPendiente = useMemo(() => {
    // 1. Total teórico de TODOS los alumnos (precio * 11 meses)
    const totalTeoricoAnual = alumnos.reduce((sum, alumno) => {
      return sum + (alumno.precio || 0) * 11; // 11 meses (Feb-Dic)
    }, 0);

    // 2. Total pagado de TODO el año (SOLO DE ESTE AÑO)
    const totalPagadoAnual = pagos
      .filter(p => p.estado === 'pagado' && p.mes.includes(ANIO_ESCOLAR)) // <-- FILTRO DE AÑO AÑADIDO
      .reduce((sum, p) => sum + p.monto, 0);

    // Lógica por Mes
    if (cardMonthFilter !== "Todos") {
      const totalTeoricoDelMes = alumnos.reduce((sum, alumno) => sum + (alumno.precio || 0), 0);
      const totalPagadoEseMes = pagos
        .filter(p => p.mes === cardMonthFilter && p.estado === 'pagado')
        .reduce((sum, p) => sum + p.monto, 0);
      
      const saldo = totalTeoricoDelMes - totalPagadoEseMes;
      return saldo < 0 ? 0 : saldo;
    }

    // Lógica General ("Todos"): Deuda total del año
    const saldoAnual = totalTeoricoAnual - totalPagadoAnual;
    return saldoAnual < 0 ? 0 : saldoAnual;

  }, [pagos, alumnos, cardMonthFilter]); // <-- BUG CORREGIDO
  
  const totalRegistros = useMemo(() =>
    pagosParaTarjetas.length,
  [pagosParaTarjetas]);

  // --- BORRAR PAGO CON API ---
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de ELIMINAR este registro de pago? Esta acción es permanente.")) {
      return;
    }
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
  };

  // --- MANEJO DE ESTADOS DE CARGA/ERROR ---
  if (loading) {
    // ... (igual)
    return (
      <DashboardLayout title="Gestión de Pagos" menuItems={menuItems}>
        <div className="flex justify-center items-center h-64"><p>Cargando pagos...</p></div>
      </DashboardLayout>
    );
  }
  if (error) {
    // ... (igual)
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
        
        {/* --- NUEVO FILTRO DE MES PARA TARJETAS --- */}
        <div className="flex justify-end">
          <Select onValueChange={setCardMonthFilter} defaultValue={cardMonthFilter}>
            <SelectTrigger className="w-full md:w-[240px]">
              <SelectValue placeholder="Filtrar totales por mes" />
            </SelectTrigger>
            <SelectContent>
              {MESES_FILTRO.map(mes => (
                <SelectItem key={mes} value={mes}>
                  {mes === "Todos" ? "Totales (Todo el Año)" : mes}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* --- TARJETAS DE RESUMEN (grid-cols-3) --- */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardDescription className="text-xs">Total Pagado</CardDescription></CardHeader>
            <CardContent><div className="text-xl md:text-2xl font-bold text-green-600">C${totalPagado.toLocaleString()}</div></CardContent>
          </Card>
           <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">
                {cardMonthFilter === "Todos" ? "Total Pendiente (Anual)" : `Pendiente (${cardMonthFilter.split(" ")[0]})`}
              </CardDescription>
            </CardHeader>
            <CardContent><div className="text-xl md:text-2xl font-bold text-orange-600">C${totalPendiente.toLocaleString()}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardDescription className="text-xs">Total Registros</CardDescription></CardHeader>
            <CardContent><div className="text-xl md:text-2xl font-bold">{totalRegistros}</div></CardContent>
          </Card>
        </div>

        {/* --- CONTROLES DE BÚSQUEDA Y ACCIÓN --- */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
          <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por alumno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            {/* --- FILTRO DE ESTADO ELIMINADO --- */}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
             <Button 
                variant="outline" 
                onClick={() => setViewMode(viewMode === 'lista' ? 'cuaderno' : 'lista')}
                className="w-full sm:w-auto"
                title={viewMode === 'lista' ? "Cambiar a Vista de Resumen Anual" : "Cambiar a Vista de Historial"}
             >
                {viewMode === 'lista' ? 
                  <LayoutGrid className="h-4 w-4 mr-2" /> : 
                  <List className="h-4 w-4 mr-2" />
                }
                {viewMode === 'lista' ? 'Ver Resumen' : 'Ver Historial'}
             </Button>
             
             <Link href="/dashboard/propietario/pagos/nuevo" className="w-full sm:w-auto">
                <Button className="w-full">
                   <Plus className="h-4 w-4 mr-2" />
                   Registrar Pago
                </Button>
             </Link>
          </div>
        </div>

        {/* --- RENDERIZADO CONDICIONAL DE LA TABLA --- */}
        <Card>
          {viewMode === 'lista' ? (
            <>
              {/* --- VISTA DE LISTA (COLUMNA "ESTADO" ELIMINADA) --- */}
              <CardHeader>
                <CardTitle>Historial de Transacciones</CardTitle>
                <CardDescription>
                  Cada pago individual. La lista se filtra por el mes seleccionado arriba.
                </CardDescription>
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
                        {/* <TableHead>Estado</TableHead> <-- ELIMINADO */}
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPagos.length === 0 && (
                        <TableRow>
                          {/* Colspan reducido a 5 */}
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No se encontraron pagos con esos filtros.
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredPagos.map((pago) => (
                        <TableRow key={pago.id}>
                          <TableCell className="font-medium whitespace-nowrap">{pago.alumnoNombre}</TableCell>
                          <TableCell className="whitespace-nowrap">{pago.mes}</TableCell>
                          <TableCell className="whitespace-nowrap">C${formatCurrency(pago.monto)}</TableCell>
                          <TableCell className="whitespace-nowrap">{pago.fecha ? new Date(pago.fecha + 'T00:00:00').toLocaleDateString('es-NI') : "-"}</TableCell>
                          {/* ESTADO ELIMINADO */}
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/dashboard/propietario/pagos/${pago.id}`}>
                                <Button variant="ghost" size="icon" title="Editar">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="icon" title="Eliminar" onClick={() => handleDelete(pago.id)}>
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
            </>
          ) : (
            <>
              {/* --- VISTA DE CUADERNO (LÓGICA DE DICIEMBRE MEJORADA) --- */}
              <CardHeader>
                <CardTitle>Resumen Anual (Vista Cuaderno)</CardTitle>
                <CardDescription>
                  Fechas de pago registradas por alumno para el año {ANIO_ESCOLAR}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="min-w-[1200px] md:min-w-[1400px]"> 
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[160px] min-w-[160px] md:w-[200px] md:min-w-[200px]">
                          Alumno
                        </TableHead>
                        <TableHead className="w-[100px] min-w-[100px] md:w-[120px] md:min-w-[120px]">
                          Mensualidad
                        </TableHead>
                        {MESES_CUADERNO.map(mes => (
                          <TableHead key={mes} className="text-center w-[100px]">
                            {mes.split(" ")[0]} 
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>{
                       cuadernoData.sortedGroupKeys.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={13} className="text-center text-muted-foreground">
                            No se encontraron alumnos con ese término de búsqueda.
                          </TableCell>
                        </TableRow>
                      ) : (
                      cuadernoData.sortedGroupKeys.map(grado => (
                        <React.Fragment key={grado}>
                          <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableCell colSpan={13} className="bg-muted/50 font-semibold text-sm">
                              {grado}
                            </TableCell>
                          </TableRow>
                          {cuadernoData.grouped[grado].map((alumno) => (
                            <TableRow key={alumno.id}>
                              <TableCell className="font-medium w-[160px] min-w-[160px] md:w-[200px] md:min-w-[200px]">
                                {alumno.nombre}
                              </TableCell>
                              <TableCell className="font-medium w-[100px] min-w-[100px] md:w-[120px] md:min-w-[120px]">
                                C$ {formatCurrency(alumno.precio || 0)}
                              </TableCell>
                              {alumno.meses.map((mesData: { 
                                mes: string, 
                                fechaSimple: string | null, 
                                abonos: { fecha: string, monto: number }[],
                                esDiciembrePagado: boolean,
                                ultimaFechaDiciembre: string | null // <-- Esta propiedad ya no se usa
                              }) => (
                                <TableCell key={mesData.mes} className="text-center align-top">
                                  {mesData.mes === MES_DICIEMBRE ? (
                                    // --- LÓGICA DE DICIEMBRE CORREGIDA ---
                                    mesData.abonos.length > 0 ? (
                                      <div className="flex flex-col gap-1 items-center">
                                        {mesData.abonos.map((abono: { fecha: string, monto: number }, idx: number) => (
                                          <Badge 
                                            key={idx} 
                                            // Cambia el color si Diciembre está pagado
                                            variant={mesData.esDiciembrePagado ? "default" : "secondary"} 
                                            className="text-xs whitespace-nowrap"
                                          >
                                            {abono.fecha} - C${formatCurrency(abono.monto)}
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )
                                    // --- FIN LÓGICA DICIEMBRE ---
                                  ) : (
                                    // Lógica Meses Regulares (Feb-Nov)
                                    mesData.fechaSimple ? (
                                      <Badge variant="default">{mesData.fechaSimple}</Badge>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ))
                    )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
  
}