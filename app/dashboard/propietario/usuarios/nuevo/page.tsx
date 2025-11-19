"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
    ArrowLeft, 
    Save, 
    Users, 
    DollarSign, 
    Bus, 
    UserCog, 
    Bell, 
    BarChart3, 
    TrendingDown,
    Loader2
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

// --- Menú ---
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

export default function NuevoUsuarioPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Estado para cargar lista de vehículos (para asistentes/choferes)
  const [vehiculos, setVehiculos] = useState<any[]>([])

  const [formData, setFormData] = useState({
    nombre: "",
    rol: "tutor", // Valor por defecto
    vehiculoId: "", // Solo para personal
  })

  // Cargar vehículos al iniciar
  useEffect(() => {
      const fetchVehiculos = async () => {
          try {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehiculos`);
              if (res.ok) setVehiculos(await res.json());
          } catch (e) { console.error(e); }
      };
      fetchVehiculos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // --- GENERACIÓN DE USUARIO AUTOMÁTICA ---
    // Ej: "Juan Perez" -> "juan.perez" + 4 dígitos aleatorios
    const baseUser = formData.nombre.toLowerCase().replace(/\s+/g, '.');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedEmail = `${baseUser}.${randomSuffix}@sistema.com`; // Usamos formato email falso para compatibilidad con Auth

    const payload = {
        nombre: formData.nombre,
        email: generatedEmail, // Se guarda como email en BD, pero el usuario usará el "username" (parte antes del @)
        contrasena: "123456", // Contraseña por defecto
        rol: formData.rol,
        vehiculoId: (formData.rol === 'asistente' || formData.rol === 'chofer') ? formData.vehiculoId : null
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("No se pudo registrar el usuario")

      toast({ 
          title: "Usuario Creado", 
          description: `Usuario: ${generatedEmail} | Pass: 123456` 
      })
      router.push("/dashboard/propietario/usuarios")

    } catch (err: any) {
      toast({ title: "Error al guardar", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Nuevo Usuario" menuItems={menuItems}>
      <div className="space-y-6">
        <Link href="/dashboard/propietario/usuarios">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nuevo Usuario</CardTitle>
            <CardDescription>El sistema generará las credenciales automáticamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol">Rol *</Label>
                <Select
                  value={formData.rol}
                  onValueChange={(value) => setFormData({ ...formData, rol: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutor">Tutor (Padre de Familia)</SelectItem>
                    <SelectItem value="asistente">Asistente (Personal)</SelectItem>
                    <SelectItem value="chofer">Chofer (Personal)</SelectItem>
                    <SelectItem value="propietario">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Campo condicional: Solo si es Personal, pide Vehículo */}
              {(formData.rol === 'asistente' || formData.rol === 'chofer') && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="vehiculo">Vehículo Asignado *</Label>
                    <Select
                      value={formData.vehiculoId}
                      onValueChange={(value) => setFormData({ ...formData, vehiculoId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehiculos.map(v => (
                            <SelectItem key={v.id} value={v.id}>{v.nombre} ({v.placa})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">Necesario para que vean su ruta.</p>
                  </div>
              )}

              <div className="bg-muted/50 p-4 rounded-md text-sm text-muted-foreground border border-dashed">
                  <p><strong>Nota:</strong> Al guardar, se generará un usuario único y la contraseña será <strong>123456</strong>.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Save className="h-4 w-4 mr-2" />}
                  {loading ? "Guardando..." : "Guardar Usuario"}
                </Button>
                <Link href="/dashboard/propietario/usuarios">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}