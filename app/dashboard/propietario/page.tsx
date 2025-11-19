"use client"

import { useState, useEffect } from "react"
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
    Users, DollarSign, Bus, UserCog, Bell, BarChart3, TrendingDown, 
    AlertTriangle, CalendarDays, Save, Loader2, Settings
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

  // Datos Formularios
  const [motivoEmergencia, setMotivoEmergencia] = useState("")
  const [fechaSuspension, setFechaSuspension] = useState("") 

  const [configEscolar, setConfigEscolar] = useState({
    inicioAnioEscolar: "",
    finAnioEscolar: "",
    inicioVacacionesMedioAnio: "",
    finVacacionesMedioAnio: ""
  })

  // 1. Cargar Estadísticas al iniciar
  useEffect(() => {
    const fetchStats = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuracion/stats`);
            if(res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error cargando stats");
        }
    }
    fetchStats();
  }, []);

  // 2. Cargar Configuración
  const fetchConfig = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuracion`)
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

  // Acción: Guardar Configuración
  const handleSaveConfig = async () => {
    setLoadingConfig(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuracion`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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

  // Acción: Suspender Clases
  const handleEmergencyStop = async () => {
    if (!motivoEmergencia.trim() || !fechaSuspension) return
    setLoadingConfig(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dias-no-lectivos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            fecha: fechaSuspension, 
            motivo: motivoEmergencia 
        })
      })
      if (!res.ok) {
         if (res.status === 409) throw new Error("Ya existe una suspensión para esa fecha.")
         throw new Error("Error al suspender")
      }
      toast({ 
        title: "Día No Lectivo Registrado", 
        description: `Se han suspendido las clases para el: ${fechaSuspension}`,
        variant: "destructive" 
      })
      setIsEmergencyOpen(false)
      setMotivoEmergencia("")
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoadingConfig(false)
    }
  }

  // Abrir modal de emergencia (pone fecha de hoy por defecto)
  const openEmergencyModal = () => {
      setFechaSuspension(new Date().toISOString().split('T')[0]);
      setIsEmergencyOpen(true);
  }

  return (
    <DashboardLayout title="Panel del Propietario" menuItems={menuItems}>
      <div className="space-y-8">
        
        {/* --- BOTONES GRANDES DE ACCIÓN (ESTILO TARJETA) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Botón: Suspender (Rojo) */}
            <Dialog open={isEmergencyOpen} onOpenChange={setIsEmergencyOpen}>
                <DialogTrigger asChild>
                    <Card 
                        onClick={openEmergencyModal}
                        className="border-l-8 border-l-red-500 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 group"
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-red-600 uppercase tracking-wide">
                                Zona de Emergencia
                            </CardTitle>
                            <AlertTriangle className="h-6 w-6 text-red-600 group-hover:scale-110 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">Suspender Hoy</div>
                            <p className="text-sm text-gray-500 mt-1">
                                Registrar día no lectivo por fuerza mayor.
                            </p>
                        </CardContent>
                    </Card>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Suspender Operaciones</DialogTitle>
                        <DialogDescription>
                            Registra un día en el que no habrá clases (Feriado, Emergencia, etc).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fecha">Fecha de Suspensión</Label>
                            <Input 
                                id="fecha" 
                                type="date"
                                value={fechaSuspension}
                                onChange={(e) => setFechaSuspension(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="motivo">Motivo</Label>
                            <Input 
                                id="motivo" 
                                placeholder="Ej: Lluvia intensa, Paro nacional..." 
                                value={motivoEmergencia}
                                onChange={(e) => setMotivoEmergencia(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEmergencyOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleEmergencyStop} disabled={loadingConfig || !motivoEmergencia || !fechaSuspension}>
                            {loadingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Suspensión"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Botón: Configurar (Azul) */}
            <Dialog open={isConfigOpen} onOpenChange={(open) => { setIsConfigOpen(open); if (open) fetchConfig(); }}>
                <DialogTrigger asChild>
                    <Card className="border-l-8 border-l-blue-500 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-blue-600 uppercase tracking-wide">
                                Administración
                            </CardTitle>
                            <Settings className="h-6 w-6 text-blue-600 group-hover:rotate-45 transition-transform" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">Ciclo Escolar</div>
                            <p className="text-sm text-gray-500 mt-1">
                                Definir fechas de inicio, fin y vacaciones.
                            </p>
                        </CardContent>
                    </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                     <DialogHeader>
                        <DialogTitle>Configuración del Ciclo</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Inicio de Clases</Label>
                                <Input type="date" value={configEscolar.inicioAnioEscolar} onChange={(e) => setConfigEscolar({...configEscolar, inicioAnioEscolar: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Fin de Clases (Estimado)</Label>
                                <Input type="date" value={configEscolar.finAnioEscolar} onChange={(e) => setConfigEscolar({...configEscolar, finAnioEscolar: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2 border-t pt-4">
                            <h4 className="font-medium text-sm">Vacaciones de Medio Año</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Inicio Vacaciones</Label>
                                <Input type="date" value={configEscolar.inicioVacacionesMedioAnio} onChange={(e) => setConfigEscolar({...configEscolar, inicioVacacionesMedioAnio: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Fin Vacaciones</Label>
                                <Input type="date" value={configEscolar.finVacacionesMedioAnio} onChange={(e) => setConfigEscolar({...configEscolar, finVacacionesMedioAnio: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfigOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveConfig} disabled={loadingConfig}>
                            {loadingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Cambios"}
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