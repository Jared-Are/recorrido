"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout, type MenuItem } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Importar Select
import { ArrowLeft, Save, Users, DollarSign, Bus, UserCog, Bell, BarChart3, TrendingDown } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
// Quitamos los mocks
// import { mockAlumnos, mockPagos } from "@/lib/mock-data"

// --- DEFINICIÓN DEL TIPO ALUMNO (DESDE LA BD) ---
type Alumno = {
  id: string;
  nombre: string;
  precio?: number;
};

// --- DEFINICIÓN DEL TIPO PAGO (DESDE LA BD) ---
export type Pago = {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  monto: number;
  mes: string;
  fecha: string; 
  estado: "pagado" | "pendiente";
};

// --- DEFINICIÓN DEL MENÚ (Copiado de tus archivos) ---
const menuItems: MenuItem[] = [/* ... tu menú ... */];


export default function NuevoPagoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [pagarAnioCompleto, setPagarAnioCompleto] = useState(false)
  
  // Estados para datos de la API
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  
  const [formData, setFormData] = useState({
    alumnoId: "",
    alumnoNombre: "",
    monto: "",
    mes: "",
    fecha: new Date().toISOString().split("T")[0],
  })

  // --- Cargar Alumnos y Pagos desde la API ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alumnosRes, pagosRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/alumnos`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/pagos`)
        ]);
        if (!alumnosRes.ok || !pagosRes.ok) {
          throw new Error('No se pudieron cargar los datos iniciales');
        }
        const alumnosData: Alumno[] = await alumnosRes.json();
        const pagosData: Pago[] = await pagosRes.json();
        setAlumnos(alumnosData);
        setPagos(pagosData);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, [toast]);

  // Hook para actualizar el formulario (Tu lógica original, ¡adaptada a la API!)
  useEffect(() => {
    if (!formData.alumnoId) return

    const alumno = alumnos.find((a) => a.id === formData.alumnoId)
    if (!alumno) return
    
    const montoMensual = alumno.precio ?? 800
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]

    let mesSugerido = "Enero 2025"
    let montoSugerido = montoMensual.toString()

    if (pagarAnioCompleto) {
      montoSugerido = (montoMensual * 12).toString() // Mostramos el total, pero la API guardará por mes
      mesSugerido = "Año Completo 2025"
    } else {
      // Usamos el estado 'pagos' de la API, no 'mockPagos'
      const pagosAlumno = pagos.filter((p) => p.alumnoId === formData.alumnoId)
      if (pagosAlumno.length > 0) {
        const ultimoPago = pagosAlumno.sort((a, b) => meses.indexOf(b.mes.split(" ")[0]) - meses.indexOf(a.mes.split(" ")[0]))[0];
        const ultimoMesIdx = meses.indexOf(ultimoPago.mes.split(" ")[0]);
        const siguienteMes = meses[(ultimoMesIdx + 1) % 12];
        mesSugerido = `${siguienteMes} 2025`;
      }
    }

    setFormData(prev => ({
        ...prev,
        alumnoNombre: alumno.nombre,
        monto: montoSugerido,
        mes: mesSugerido,
    }))

  }, [formData.alumnoId, pagarAnioCompleto, alumnos, pagos]) // Depende de los datos de la API

  // --- ENVIAR A LA API ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.alumnoId) return
    setLoading(true)

    const alumno = alumnos.find(a => a.id === formData.alumnoId)
    if (!alumno) return setLoading(false);
    
    const montoMensual = alumno.precio ?? 800;

    try {
      let promesasDeCreacion: Promise<Response>[] = [];

      if (pagarAnioCompleto) {
        // --- Lógica de Año Completo (12 llamadas a la API) ---
        const meses = [
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        
        promesasDeCreacion = meses.map(mes => {
          const payload = {
            alumnoId: formData.alumnoId,
            alumnoNombre: formData.alumnoNombre,
            monto: montoMensual,
            mes: `${mes} 2025`,
            fecha: formData.fecha,
            estado: "pagado" as const,
          };
          return fetch(`${process.env.NEXT_PUBLIC_API_URL}/pagos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        });

      } else {
        // --- Lógica de Pago Único (1 llamada a la API) ---
        const payload = {
          alumnoId: formData.alumnoId,
          alumnoNombre: formData.alumnoNombre,
          monto: parseFloat(formData.monto),
          mes: formData.mes,
          fecha: formData.fecha,
          estado: "pagado" as const,
        };
        promesasDeCreacion.push(
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/pagos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        );
      }
      
      // Ejecutar todas las promesas
      const responses = await Promise.all(promesasDeCreacion);
      const algunaFallo = responses.some(res => !res.ok);
      
      if (algunaFallo) {
        throw new Error("Al menos un pago no se pudo registrar.");
      }
      
      toast({
        title: pagarAnioCompleto ? "Año Completo Registrado" : "Pago registrado",
        description: `Se registraron ${promesasDeCreacion.length} pago(s) para ${formData.alumnoNombre}.`,
      })
      router.push("/dashboard/propietario/pagos")

    } catch (err: any) {
      toast({
        title: "Error al guardar",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Registrar Pago" menuItems={menuItems}>
      <div className="space-y-6">
        <Link href="/dashboard/propietario/pagos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Nuevo Pago</CardTitle>
            <CardDescription>Selecciona un alumno y el tipo de pago.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="alumno">Alumno *</Label>
                  {/* --- Selector de Alumnos desde API --- */}
                  <Select
                    value={formData.alumnoId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, alumnoId: value }))}
                    required
                  >
                    <SelectTrigger><SelectValue placeholder="Selecciona un alumno" /></SelectTrigger>
                    <SelectContent>
                      {alumnos.map((alumno) => (
                        <SelectItem key={alumno.id} value={alumno.id}>
                          {alumno.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="items-top flex space-x-2 col-span-2">
                  <Checkbox id="anioCompleto" checked={pagarAnioCompleto} onCheckedChange={(checked) => setPagarAnioCompleto(checked as boolean)} />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor="anioCompleto" className="text-sm font-medium leading-none">
                      Pagar año completo
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Registra automáticamente los 12 meses del año.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monto">Monto</Label>
                  <Input id="monto" value={formData.monto ? `C$${parseFloat(formData.monto).toLocaleString()}` : ''} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mes">Periodo</Label>
                  <Input id="mes" value={formData.mes} disabled />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="fecha">Fecha de Pago *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading || !formData.alumnoId}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Guardando..." : "Registrar Pago"}
                </Button>
                <Link href="/dashboard/propietario/pagos">
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