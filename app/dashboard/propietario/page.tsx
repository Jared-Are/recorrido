"use client"

import { useState, useEffect } from "react"
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
    Users, DollarSign, Bus, UserCog, Bell, BarChart3, TrendingDown, 
    AlertTriangle, Settings, Loader2, GraduationCap, ArrowRight
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

// --- MENÚ ---
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

export default function PropietarioDashboard() {
  const { toast } = useToast()
  
  // Estados de Carga
  const [loadingConfig, setLoadingConfig] = useState(false)
  const [stats, setStats] = useState({
    alumnosActivos: 0,
    personal: 0,
    vehiculos: 0,
    pagosMesTotal: 0,
    mesActual: "..."
  })
  
  // Estados Modales
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isPromoteOpen, setIsPromoteOpen] = useState(false) // Nuevo Modal

  // Datos Formularios
  const [motivoEmergencia, setMotivoEmergencia] = useState("")
  const [fechaSuspension, setFechaSuspension] = useState("") 
  const [confirmacionPromocion, setConfirmacionPromocion] = useState("") // Para escribir "CONFIRMAR"

  const [configEscolar, setConfigEscolar] = useState({
    inicioAnioEscolar: "",
    finAnioEscolar: "",
    inicioVacacionesMedioAnio: "",
    finVacacionesMedioAnio: ""
  })

  // 1. Cargar Estadísticas
  useEffect(() => {
    const fetchStats = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuracion/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if(res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error cargando stats:", error);
        }
    }
    fetchStats();
  }, []);

  // 2. Cargar Configuración
  const fetchConfig = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuracion`, {
          headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setConfigEscolar({
          inicioAnioEscolar: data.inicioAnioEscolar || "",
          finAnioEscolar: data.finAnioEscolar || "",
          inicioVacacionesMedioAnio: data.inicioVacacionesMedioAnio || "",
          finVacacionesMedioAnio: data.finVacacionesMedioAnio || ""
        })
      }
    } catch (error) {
      console.error("Error cargando config", error)
    }
  }

  // --- ACCIONES ---

  const handleSaveConfig = async () => {
    setLoadingConfig(true)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuracion`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(configEscolar)
      })
      if (!res.ok) throw new Error("Error al guardar")
      toast({ title: "Configuración guardada", description: "Ciclo escolar actualizado." })
      setIsConfigOpen(false)
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" })
    } finally {
      setLoadingConfig(false)
    }
  }

  const handleEmergencyStop = async () => {
    if (!motivoEmergencia.trim() || !fechaSuspension) return
    setLoadingConfig(true)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dias-no-lectivos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fecha: fechaSuspension, motivo: motivoEmergencia })
      })
      if (!res.ok) {
         if (res.status === 409) throw new Error("Ya existe una suspensión para esa fecha.")
         throw new Error("Error al suspender")
      }
      toast({ title: "Día No Lectivo Registrado", description: `Se han suspendido las clases para el: ${fechaSuspension}`, variant: "destructive" })
      setIsEmergencyOpen(false)
      setMotivoEmergencia("")
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoadingConfig(false)
    }
  }

  // --- NUEVA ACCIÓN: PROMOCIÓN ANUAL ---
  const handlePromoteStudents = async () => {
      if (confirmacionPromocion !== "CONFIRMAR") return;
      
      setLoadingConfig(true);
      try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos/promover`, {
              method: 'PATCH',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (!res.ok) throw new Error("Error al ejecutar la promoción.");
          
          const data = await res.json();
          
          toast({ 
              title: "¡Ciclo Cerrado Exitosamente!", 
              description: `Se promovieron ${data.promovidos} alumnos y se graduaron ${data.graduados}.`,
              className: "bg-green-600 text-white"
          });
          
          setIsPromoteOpen(false);
          setConfirmacionPromocion("");
          
      } catch (error: any) {
          toast({ title: "Error crítico", description: error.message, variant: "destructive" });
      } finally {
          setLoadingConfig(false);
      }
  }

  const openEmergencyModal = () => {
      setFechaSuspension(new Date().toISOString().split('T')[0]);
      setIsEmergencyOpen(true);
  }

  return (
    <DashboardLayout title="Panel del Propietario" menuItems={menuItems}>
      <div className="space-y-8">
        
        {/* --- ZONA DE ACCIONES CRÍTICAS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Suspensión (Rojo) */}
            <Dialog open={isEmergencyOpen} onOpenChange={setIsEmergencyOpen}>
                <DialogTrigger asChild>
                    <Card onClick={openEmergencyModal} className="border-l-8 border-l-red-500 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 group">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-red-600 uppercase flex justify-between">
                                Emergencia <AlertTriangle className="h-5 w-5 group-hover:scale-110 transition-transform"/>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mt-1">Suspender Día</div>
                            <p className="text-xs text-muted-foreground mt-1">Registrar falta colectiva.</p>
                        </CardContent>
                    </Card>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Suspender Operaciones</DialogTitle>
                        <DialogDescription>No habrá cobro ni asistencia para este día.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Fecha</Label>
                            <Input type="date" value={fechaSuspension} onChange={(e) => setFechaSuspension(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Motivo</Label>
                            <Input placeholder="Ej: Lluvia intensa..." value={motivoEmergencia} onChange={(e) => setMotivoEmergencia(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEmergencyOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleEmergencyStop} disabled={loadingConfig || !motivoEmergencia}>
                            {loadingConfig ? <Loader2 className="h-4 w-4 animate-spin"/> : "Confirmar Suspensión"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 2. Configuración (Azul) */}
            <Dialog open={isConfigOpen} onOpenChange={(open) => { setIsConfigOpen(open); if (open) fetchConfig(); }}>
                <DialogTrigger asChild>
                    <Card className="border-l-8 border-l-blue-500 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 group">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-blue-600 uppercase flex justify-between">
                                Administración <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform"/>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mt-1">Ciclo Escolar</div>
                            <p className="text-xs text-muted-foreground mt-1">Fechas de inicio y vacaciones.</p>
                        </CardContent>
                    </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>Configuración del Ciclo</DialogTitle></DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Inicio Clases</Label><Input type="date" value={configEscolar.inicioAnioEscolar} onChange={(e) => setConfigEscolar({...configEscolar, inicioAnioEscolar: e.target.value})} /></div>
                            <div className="space-y-2"><Label>Fin Clases</Label><Input type="date" value={configEscolar.finAnioEscolar} onChange={(e) => setConfigEscolar({...configEscolar, finAnioEscolar: e.target.value})} /></div>
                        </div>
                        <div className="space-y-2 border-t pt-4"><h4 className="font-medium text-sm">Vacaciones Medio Año</h4></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Inicio</Label><Input type="date" value={configEscolar.inicioVacacionesMedioAnio} onChange={(e) => setConfigEscolar({...configEscolar, inicioVacacionesMedioAnio: e.target.value})} /></div>
                            <div className="space-y-2"><Label>Fin</Label><Input type="date" value={configEscolar.finVacacionesMedioAnio} onChange={(e) => setConfigEscolar({...configEscolar, finVacacionesMedioAnio: e.target.value})} /></div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveConfig} disabled={loadingConfig}>{loadingConfig ? <Loader2 className="h-4 w-4 animate-spin"/> : "Guardar"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 3. MANTENIMIENTO ANUAL (Ámbar - NUEVO) */}
            <Dialog open={isPromoteOpen} onOpenChange={setIsPromoteOpen}>
                <DialogTrigger asChild>
                    <Card className="border-l-8 border-l-amber-500 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 group">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-amber-600 uppercase flex justify-between">
                                Fin de Año <GraduationCap className="h-6 w-6 group-hover:scale-110 transition-transform"/>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mt-1">Cerrar Ciclo</div>
                            <p className="text-xs text-muted-foreground mt-1">Promover alumnos de grado.</p>
                        </CardContent>
                    </Card>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-amber-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5"/> ¡Acción Irreversible!
                        </DialogTitle>
                        {/* 👇 AQUÍ EL CAMBIO IMPORTANTE: USAMOS 'asChild' Y UN DIV */}
                        <DialogDescription asChild>
                            <div className="text-muted-foreground text-sm mt-2">
                                Estás a punto de ejecutar la <strong>Promoción Anual</strong>.
                                <br/><br/>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Los alumnos de <strong>1° a 5°</strong> pasarán al siguiente grado.</li>
                                    <li>Los alumnos de <strong>6° Grado</strong> se marcarán como <strong>Graduados (Inactivos)</strong>.</li>
                                    <li>Se recomienda hacer esto <strong>antes</strong> de iniciar los cobros de Febrero del nuevo año.</li>
                                </ul>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4 bg-muted/30 p-4 rounded-md border border-amber-200">
                        <Label className="text-amber-800 font-semibold">Escribe "CONFIRMAR" para proceder:</Label>
                        <Input 
                            value={confirmacionPromocion} 
                            onChange={(e) => setConfirmacionPromocion(e.target.value)}
                            placeholder="CONFIRMAR"
                            className="border-amber-300 focus:ring-amber-500"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPromoteOpen(false)}>Cancelar</Button>
                        <Button 
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={handlePromoteStudents} 
                            disabled={loadingConfig || confirmacionPromocion !== "CONFIRMAR"}
                        >
                            {loadingConfig ? <Loader2 className="h-4 w-4 animate-spin"/> : "Ejecutar Promoción"} <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>

        {/* --- RESUMEN OPERATIVO (DATOS REALES) --- */}
        <h3 className="text-lg font-semibold text-muted-foreground pt-4">Resumen Operativo</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardDescription className="text-xs font-medium">Alumnos Activos</CardDescription>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.alumnosActivos}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total registrados</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardDescription className="text-xs font-medium">Pagos ({stats.mesActual})</CardDescription>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">C$ {stats.pagosMesTotal.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">Recaudado este mes</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardDescription className="text-xs font-medium">Personal</CardDescription>
                    <UserCog className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.personal}</div>
                    <p className="text-xs text-muted-foreground mt-1">Choferes y Asistentes</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardDescription className="text-xs font-medium">Vehículos</CardDescription>
                    <Bus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.vehiculos}</div>
                    <p className="text-xs text-muted-foreground mt-1">En flota activa</p>
                </CardContent>
            </Card>
        </div>

      </div>
    </DashboardLayout>
  )
}