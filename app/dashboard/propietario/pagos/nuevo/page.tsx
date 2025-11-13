"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link" 
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
    Users, 
    DollarSign, 
    Bus, 
    UserCog, 
    Bell, 
    BarChart3, 
    TrendingDown,
    Search,
    Check,
    Loader2,
    CheckCheck,
    Gift,
    ArrowLeft 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator" 

// --- Tipos ---
type Alumno = {
  id: string;
  nombre: string;
  tutor: string;
  grado: string;
  precio?: number; // Precio por mes (individual)
};

type Pago = {
  id: string;
  alumnoId: string;
  mes: string;
  monto?: number; 
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
  { title: "Generar Reportes", description: "Estadísticas y análisis", icon: BarChart3, href: "/dashboard/propietario/reportes", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-500/20" },
];


// --- CONSTANTES DEL CICLO ESCOLAR ---
const ANIO_ESCOLAR = new Date().getFullYear().toString(); 
const MESES_REGULARES = [
  "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre"
];
const MES_INICIO_ESCOLAR = `${MESES_REGULARES[0]} ${ANIO_ESCOLAR}`; 
const MES_DICIEMBRE = `Diciembre ${ANIO_ESCOLAR}`; 

export default function PagosRapidosPage() { // Esta es /pagos/nuevo
  const { toast } = useToast();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [proximoMesRegular, setProximoMesRegular] = useState<Map<string, string>>(new Map());
  const [saldoDiciembre, setSaldoDiciembre] = useState<Map<string, number>>(new Map());
  const [montosAbonoDiciembre, setMontosAbonoDiciembre] = useState<Map<string, string>>(new Map());
  
  // --- 1. NUEVO ESTADO ---
  // Guardará cuántos meses regulares (Feb-Nov) le faltan a cada alumno
  const [mesesRegularesRestantes, setMesesRegularesRestantes] = useState<Map<string, number>>(new Map());


  const [pagandoRegularLoading, setPagandoRegularLoading] = useState<string | null>(null);
  const [pagandoAnioLoading, setPagandoAnioLoading] = useState<string | null>(null);
  const [pagandoDiciembreLoading, setPagandoDiciembreLoading] = useState<string | null>(null);


  // --- Cargar datos ---
  const fetchData = async () => {
    try {
      const [alumnosRes, pagosRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pagos`)
      ]);
      if (!alumnosRes.ok || !pagosRes.ok) throw new Error('No se cargaron los datos');
      
      const alumnosData: Alumno[] = await alumnosRes.json();
      const pagosData: Pago[] = await pagosRes.json();
      
      setAlumnos(alumnosData);
      setPagos(pagosData);
    } catch (error: any) {
      setError(error.message);
      toast({ title: "Error", description: `No se cargaron los datos: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 2. Calcular estados de pago (MODIFICADO) ---
  useEffect(() => {
    const nuevoProximoRegular = new Map<string, string>();
    const nuevoSaldoDiciembre = new Map<string, number>();
    const nuevoMesesRestantes = new Map<string, number>(); // Mapa para el nuevo estado

    alumnos.forEach(alumno => {
      const precioMensual = alumno.precio || 0; 
      if (precioMensual === 0) {
        nuevoProximoRegular.set(alumno.id, "Precio no definido");
        nuevoSaldoDiciembre.set(alumno.id, 0);
        nuevoMesesRestantes.set(alumno.id, 0); // No debe meses
        return; 
      }

      const pagosPorMes = new Map<string, number>(); 
      pagos
        .filter(p => p.alumnoId === alumno.id && p.mes.includes(ANIO_ESCOLAR))
        .forEach(p => {
          const mesAnio = p.mes.split(" ").slice(0, 2).join(" "); 
          const total = (pagosPorMes.get(mesAnio) || 0) + (p.monto || 0);
          pagosPorMes.set(mesAnio, total);
        });

      let mesRegularAPagar = "REGULAR PAGADO";
      let mesesRestantes = 0;
      let mesInicialIdx = -1;

      for (const [index, mes] of MESES_REGULARES.entries()) { 
        const mesCompleto = `${mes} ${ANIO_ESCOLAR}`;
        const totalPagadoEsteMes = pagosPorMes.get(mesCompleto) || 0;
        
        if (totalPagadoEsteMes < precioMensual - 0.01) { 
          mesRegularAPagar = mesCompleto;
          mesInicialIdx = index; // Guardamos el índice del primer mes que debe
          break; 
        }
      }

      if (mesInicialIdx !== -1) {
        // Si debe un mes, calculamos cuántos faltan
        mesesRestantes = MESES_REGULARES.length - mesInicialIdx;
      }
      
      nuevoProximoRegular.set(alumno.id, mesRegularAPagar);
      nuevoMesesRestantes.set(alumno.id, mesesRestantes); // Guardamos el número de meses

      // Lógica de Diciembre (sin cambios)
      const totalPagadoDiciembre = pagosPorMes.get(MES_DICIEMBRE) || 0;
      let saldoDic = precioMensual - totalPagadoDiciembre;
      if (saldoDic < 0.01) saldoDic = 0; 
      nuevoSaldoDiciembre.set(alumno.id, saldoDic);
    });

    setProximoMesRegular(nuevoProximoRegular);
    setSaldoDiciembre(nuevoSaldoDiciembre); 
    setMesesRegularesRestantes(nuevoMesesRestantes); // <-- Seteamos el nuevo estado

  }, [alumnos, pagos]);

  // --- 3. Filtrar alumnos (MODIFICADO) ---
  const alumnosFiltrados = useMemo(() => {
    return alumnos
      .map(alumno => ({
        ...alumno,
        proximoMesRegular: proximoMesRegular.get(alumno.id) || MES_INICIO_ESCOLAR,
        saldoDiciembre: saldoDiciembre.get(alumno.id) ?? (alumno.precio || 0),
        // Añadimos los meses restantes al objeto del alumno
        mesesRestantes: mesesRegularesRestantes.get(alumno.id) ?? 0 
      }))
      .filter(a => 
        a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.tutor.toLowerCase().includes(searchTerm.toLowerCase())
      );
  // Añadimos la nueva dependencia
  }, [alumnos, searchTerm, proximoMesRegular, saldoDiciembre, mesesRegularesRestantes]); 

  // --- 4. Handler Pagar Regular (Feb-Nov) ---
  const handlePagarRegular = async (alumno: Alumno, mesRegularAPagar: string) => {
    setPagandoRegularLoading(alumno.id);
    const montoAPagar = alumno.precio || 0; 
    if (montoAPagar === 0) {
      toast({ title: "Error", description: "El alumno no tiene un precio mensual definido.", variant: "destructive" });
      setPagandoRegularLoading(null);
      return;
    }

    const payload = {
      alumnoId: alumno.id,
      alumnoNombre: alumno.nombre,
      monto: montoAPagar, 
      mes: mesRegularAPagar,
      fecha: new Date().toISOString().split("T")[0],
      estado: "pagado" as const
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
         // Intentar leer el error del backend
        const errData = await response.json();
        throw new Error(errData.message || "El pago no se pudo registrar.");
      }
      
      const nuevoPago = await response.json(); 
      toast({
        title: "¡Pago Registrado!",
        description: `Se registró el pago de ${mesRegularAPagar} para ${alumno.nombre}.`
      });
      setPagos(prevPagos => [...prevPagos, nuevoPago]);
    } catch (err: any) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setPagandoRegularLoading(null); 
    }
  };

  // --- 5. Handler Pagar Año (Feb-Nov) (BATCH) ---
  const handlePagarAnioRegular = async (alumno: Alumno, mesInicialRegular: string) => {
    setPagandoAnioLoading(alumno.id);
    const mesInicialIdx = MESES_REGULARES.indexOf(mesInicialRegular.split(" ")[0]);
    if (mesInicialIdx === -1) {
      toast({ title: "Error", description: "No se pudo determinar el mes de inicio regular.", variant: "destructive" });
      setPagandoAnioLoading(null);
      return;
    }

    const mesesAPagar = MESES_REGULARES
      .slice(mesInicialIdx) 
      .map(m => `${m} ${ANIO_ESCOLAR}`); 

    const payload = {
      alumnoId: alumno.id,
      alumnoNombre: alumno.nombre,
      montoPorMes: alumno.precio || 0,
      meses: mesesAPagar, 
      fecha: new Date().toISOString().split("T")[0],
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pagos/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
       if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "El pago en lote no se pudo registrar.");
      }
      
      const nuevosPagos: Pago[] = await response.json(); 
      toast({
        title: "¡Meses Regulares Pagados!",
        description: `Se registraron ${nuevosPagos.length} meses (Feb-Nov) para ${alumno.nombre}.`
      }); // <-- ¡¡¡ESTE ES EL BRACKET QUE FALTABA!!!
      
      // Importante: usamos 'nuevosPagos' que devuelve el API (que ya filtró duplicados)
      setPagos(prevPagos => [...prevPagos, ...nuevosPagos]); 
    } catch (err: any) {
      toast({ title: "Error de API (Batch)", description: (err as Error).message, variant: "destructive", duration: 7000 });
    } finally {
      setPagandoAnioLoading(null); 
    }
  };

  // --- 6. Handler Abono Diciembre ---
  const handleAbonarDiciembre = async (alumno: Alumno, saldoActual: number) => {
    setPagandoDiciembreLoading(alumno.id);
    const abonoString = montosAbonoDiciembre.get(alumno.id) || '';
    const montoAbono = parseFloat(abonoString);

    if (!abonoString || isNaN(montoAbono) || montoAbono <= 0) {
      toast({ title: "Monto Inválido", description: "Ingrese un monto válido para el abono de Diciembre.", variant: "destructive" });
      setPagandoDiciembreLoading(null);
      return;
    }
    if (montoAbono > (saldoActual + 0.01)) { 
      toast({ 
        title: "Monto Excesivo", 
        description: `El abono (C$ ${montoAbono.toFixed(2)}) no puede ser mayor al saldo pendiente (C$ ${saldoActual.toFixed(2)}).`, 
        variant: "destructive",
        duration: 5000
      });
      setPagandoDiciembreLoading(null);
      return;
    }

    const payload = {
      alumnoId: alumno.id,
      alumnoNombre: alumno.nombre,
      monto: montoAbono, 
      mes: MES_DICIEMBRE, 
      fecha: new Date().toISOString().split("T")[0],
      estado: "pagado" as const
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "El abono no se pudo registrar.");
      }
      
      const nuevoPago = await response.json(); 

      toast({
        title: "¡Abono Registrado!",
        description: `Se registró un abono de C$ ${montoAbono.toFixed(2)} para ${MES_DICIEMBRE}.`
      });
      setPagos(prevPagos => [...prevPagos, nuevoPago]);
      
      setMontosAbonoDiciembre(prev => {
        const nuevoMapa = new Map(prev);
        nuevoMapa.delete(alumno.id);
        return nuevoMapa;
      });

    } catch (err: any) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setPagandoDiciembreLoading(null); 
    }
  };

  // --- RENDERIZADO ---
  if (loading) {
    return (
      <DashboardLayout title="Gestión de Pagos" menuItems={menuItems}>
        <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
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

  return (
    <DashboardLayout title="Gestión de Pagos" menuItems={menuItems}>
      <div className="space-y-4">
        
        <Link href="/dashboard/propietario/pagos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <CardTitle>Registro Rápido de Pagos</CardTitle>
                <CardDescription>
                  Pague meses regulares (Feb-Nov) o abone a Diciembre en cualquier momento.
                </CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar alumno o tutor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {/* Encabezado de la lista */}
            <div className="hidden md:flex justify-between items-center p-3 font-semibold text-sm text-muted-foreground">
              <div className="w-1/4">Alumno</div>
              <div className="w-1/4 text-center">Pago Regular (Feb-Nov)</div>
              <div className="w-1/4 text-center">Pago Diciembre</div>
              <div className="w-1/4 text-right">Acciones</div>
            </div>
            
            {/* Lista de Alumnos */}
            {alumnosFiltrados.map((alumno) => {
              const esRegularPagado = alumno.proximoMesRegular === "REGULAR PAGADO";
              const esDiciembrePagado = alumno.saldoDiciembre < 0.01;

              const isLoadingRegular = pagandoRegularLoading === alumno.id || pagandoAnioLoading === alumno.id;
              const isLoadingDiciembre = pagandoDiciembreLoading === alumno.id;
              const isLoading = isLoadingRegular || isLoadingDiciembre;
              
              const precioMensual = (alumno.precio || 0);
              
              // --- 4. CÁLCULO PARA EL BOTÓN ---
              const mesesRestantes = alumno.mesesRestantes;
              const totalAnioRestante = precioMensual * mesesRestantes;

              return (
                <div
                  key={alumno.id}
                  className="flex flex-col md:flex-row justify-between items-stretch p-3 border rounded-lg hover:bg-muted/50 gap-4"
                >
                  {/* Col 1: Alumno */}
                  <div className="w-full md:w-1/4 flex items-center">
                    <div>
                      <p className="font-medium">{alumno.nombre}</p>
                      <p className="text-xs text-muted-foreground">{alumno.grado} - {alumno.tutor}</p>
                      <p className="text-xs text-muted-foreground font-medium">
                        Mensualidad: C$ {precioMensual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Col 2: Pago Regular (Feb-Nov) */}
                  <div className="w-full md:w-1/4 flex flex-col justify-center text-left md:text-center">
                    <span className="text-sm font-semibold md:hidden">Pago Regular (Feb-Nov)</span>
                    {esRegularPagado ? (
                      <Badge variant="default" className="w-fit md:mx-auto">Pagado</Badge>
                    ) : (
                      <span className="font-medium">{alumno.proximoMesRegular}</span>
                    )}
                  </div>

                  {/* Col 3: Pago Diciembre */}
                  <div className="w-full md:w-1/4 flex flex-col justify-center text-left md:text-center">
                    <span className="text-sm font-semibold md:hidden">Saldo Diciembre</span>
                    {esDiciembrePagado ? (
                      <Badge variant="default" className="w-fit md:mx-auto">Pagado</Badge>
                    ) : (
                      <span className="font-medium">
                        C$ {alumno.saldoDiciembre.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                  
                  {/* Col 4: Acciones (Dividido en dos) */}
                  <div className="w-full md:w-1/4 text-left md:text-right space-y-3">
                    
                    {/* Acciones Regulares (Feb-Nov) */}
                    <div className="space-y-2">
                      <Button 
                        onClick={() => handlePagarRegular(alumno, alumno.proximoMesRegular)}
                        disabled={isLoading || esRegularPagado}
                        size="sm"
                        className="w-full"
                        title="Pagar el próximo mes regular pendiente"
                      >
                        {pagandoRegularLoading === alumno.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Pagar Mes (C$ {precioMensual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </Button>
                      <Button 
                        onClick={() => handlePagarAnioRegular(alumno, alumno.proximoMesRegular)}
                        disabled={isLoading || esRegularPagado}
                        size="sm"
                        variant="outline"
                        className="w-full"
                        // Texto del Tooltip
                        title={`Pagar ${mesesRestantes} meses restantes por un total de C$ ${totalAnioRestante.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      >
                        {pagandoAnioLoading === alumno.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
                        Pagar Año (C$ {totalAnioRestante.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </Button>
                    </div>

                    <Separator />

                    {/* Acciones Diciembre */}
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder={esDiciembrePagado ? "Diciembre Pagado" : `Abono (Max: ${alumno.saldoDiciembre.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
                        value={montosAbonoDiciembre.get(alumno.id) || ''}
                        onChange={(e) => {
                          const nuevoMapa = new Map(montosAbonoDiciembre);
                          nuevoMapa.set(alumno.id, e.target.value);
                          setMontosAbonoDiciembre(nuevoMapa);
                        }}
                        disabled={isLoading || esDiciembrePagado}
                        className="w-full"
                      />
                      <Button 
                        onClick={() => handleAbonarDiciembre(alumno, alumno.saldoDiciembre)}
                        disabled={isLoading || esDiciembrePagado}
                        size="sm"
                        className="w-full"
                        variant="secondary"
                        title="Abonar al saldo de Diciembre"
                      >
                        {pagandoDiciembreLoading === alumno.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gift className="mr-2 h-4 w-4" />}
                        Abonar a Diciembre
                      </Button>
                    </div>

                  </div>
                </div>
              )
            })}
            
            {alumnosFiltrados.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No se encontraron alumnos.</p>
            )}

          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}