"use client"

import { useState, useEffect } from "react"
import { TutorLayout } from "@/components/tutor-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, PiggyBank } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

type Pago = {
  id: string;
  mes: string;
  monto: number;
  estado: 'pagado' | 'pendiente';
  alumno: { 
    nombre: string; 
    precio: number; 
  };
}

export default function PagosTutorPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [pagos, setPagos] = useState<Pago[]>([])

  useEffect(() => {
    const fetchPagos = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tutor/pagos`)
        if (!res.ok) throw new Error("Error al cargar pagos")
        const data = await res.json()
        setPagos(data)
      } catch (error) {
        toast({ title: "Error", description: "No se pudo cargar el historial de pagos.", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchPagos()
  }, [toast])

  // --- Lógica de Agrupación ---
  const pagosAgrupados = pagos.reduce((acc, pago) => {
    const mes = pago.mes
    if (!acc[mes]) {
      const todosPagosDelMes = pagos.filter(p => p.mes === mes);
      const algunPendiente = todosPagosDelMes.some(p => p.estado === 'pendiente');
      const montoPagadoTotal = todosPagosDelMes.reduce((sum, p) => sum + Number(p.monto), 0);
      
      const alumnosUnicos = new Map();
      todosPagosDelMes.forEach(p => {
        if (p.alumno) alumnosUnicos.set(p.alumno.nombre, p.alumno.precio || 0);
      });
      
      let montoEsperadoTotal = 0;
      alumnosUnicos.forEach((precio) => montoEsperadoTotal += Number(precio));

      let estadoFinal = 'pagado';
      const esDiciembre = mes.toLowerCase().includes('diciembre');
      
      if (todosPagosDelMes.some(p => p.estado === 'pendiente')) {
          estadoFinal = 'pendiente';
      }
      if (montoPagadoTotal < montoEsperadoTotal) {
          estadoFinal = 'pendiente';
      }

      acc[mes] = {
        mes: mes,
        montoPagado: montoPagadoTotal,
        montoEsperado: montoEsperadoTotal,
        estado: estadoFinal,
        alumnos: Array.from(alumnosUnicos.keys()),
        esDiciembre: esDiciembre
      }
    }
    return acc
  }, {} as Record<string, { 
      mes: string; 
      montoPagado: number; 
      montoEsperado: number; 
      estado: string; 
      alumnos: string[]; 
      esDiciembre: boolean 
  }>)

  // --- NUEVA LÓGICA DE ORDENAMIENTO ---
  const mesesOrden: Record<string, number> = {
    "enero": 0, "febrero": 1, "marzo": 2, "abril": 3, "mayo": 4, "junio": 5,
    "julio": 6, "agosto": 7, "septiembre": 8, "octubre": 9, "noviembre": 10, "diciembre": 11
  };

  const parseMesValor = (mesStr: string) => {
    // Espera formato "Mes Año" (ej: "Noviembre 2025")
    const partes = mesStr.trim().split(" ");
    if (partes.length < 2) return 0;

    const nombreMes = partes[0].toLowerCase();
    const anio = parseInt(partes[1]);
    const indiceMes = mesesOrden[nombreMes] ?? 0;

    // Truco matemático: Año * 100 + mes (ej: 202511) para ordenar fácil
    return (anio * 100) + indiceMes;
  }

  const pagosConsolidados = Object.values(pagosAgrupados).sort((a, b) => {
      // Orden descendente (b - a)
      return parseMesValor(b.mes) - parseMesValor(a.mes);
  });
  // ------------------------------------

  if (loading) {
    return (
        <TutorLayout title="Historial de Pagos">
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        </TutorLayout>
    )
  }

  return (
    <TutorLayout title="Historial de Pagos">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pagos de la Familia</CardTitle>
            <CardDescription>Registro de pagos consolidados por mes.</CardDescription>
          </CardHeader>
          <CardContent>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Alumnos</TableHead>
                    <TableHead>Mes</TableHead>
                    <TableHead>Detalle Pago</TableHead>
                    <TableHead className="text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagosConsolidados.length > 0 ? (
                    pagosConsolidados.map((pago) => {
                        const porcentaje = pago.montoEsperado > 0 
                            ? Math.min(100, (pago.montoPagado / pago.montoEsperado) * 100) 
                            : 0;

                        return (
                      <TableRow key={pago.mes}>
                        <TableCell className="font-medium align-top">
                          <div className="flex flex-col">
                            {pago.alumnos.map((nombre, i) => (
                              <span key={i} className="text-xs md:text-sm">{nombre}</span>
                            ))}
                          </div>
                        </TableCell>
                        
                        <TableCell className="whitespace-nowrap align-top pt-4">{pago.mes}</TableCell>
                        
                        <TableCell className="align-top">
                            <div className="flex flex-col gap-1">
                                <span className="font-semibold text-base">
                                    C$ {pago.montoPagado.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                                </span>
                                
                                {pago.esDiciembre && pago.estado === 'pendiente' && (
                                    <div className="w-32">
                                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                            <span>Abonado</span>
                                            <span>Meta: C$ {pago.montoEsperado}</span>
                                        </div>
                                        <Progress value={porcentaje} className="h-2" />
                                        <p className="text-[10px] text-blue-600 mt-1 font-medium">
                                            Resta: C$ {(pago.montoEsperado - pago.montoPagado).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TableCell>

                        <TableCell className="text-right align-top pt-4">
                          {pago.estado === "pagado" ? (
                              <Badge variant="default">Pagado</Badge>
                          ) : (
                              pago.esDiciembre ? (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                    <PiggyBank className="w-3 h-3 mr-1" /> Abonando
                                </Badge>
                              ) : (
                                <Badge variant="destructive">Pendiente</Badge>
                              )
                          )}
                        </TableCell>
                      </TableRow>
                    )})
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <AlertCircle className="h-8 w-8 opacity-20" />
                            <p>No hay registros de pago aún.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

          </CardContent>
        </Card>
      </div>
    </TutorLayout>
  )
}