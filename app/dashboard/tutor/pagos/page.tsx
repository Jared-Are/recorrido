"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockPagos, mockAlumnos } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// --- DATOS DEL TUTOR Y SUS HIJOS ---
const tutorData = {
  hijos: mockAlumnos.filter(a => a.tutor === "María Pérez"),
};

export default function PagosPage() {
  const hijosIds = tutorData.hijos.map(h => h.id);
  const pagos = mockPagos.filter(p => hijosIds.includes(p.alumnoId));

  // --- LÓGICA ACTUALIZADA PARA PAGOS FAMILIARES ---
  const pagosAgrupados = pagos.reduce((acc, pago) => {
    const mes = pago.mes;
    // Solo procesamos un mes si no lo hemos visto antes
    if (!acc[mes]) {
      // Buscamos el primer pago de este mes que tenga un monto. Ese es el pago familiar.
      const pagoFamiliar = pagos.find(p => p.mes === mes && p.monto > 0) || pago;
      
      // Verificamos si algún pago de este mes está pendiente
      const estaPendiente = pagos.some(p => p.mes === mes && p.estado === 'pendiente');

      acc[mes] = {
        mes: mes,
        monto: pagoFamiliar.monto, // Tomamos el monto del primer registro encontrado
        estado: estaPendiente ? "pendiente" : "pagado",
        alumnos: tutorData.hijos.map(h => h.nombre), // Listamos a todos los hijos
      };
    }
    return acc;
  }, {} as Record<string, { mes: string; monto: number; estado: "pagado" | "pendiente"; alumnos: string[] }>);

  const pagosConsolidados = Object.values(pagosAgrupados);

  return (
    <DashboardLayout title="Historial de Pagos">
      <div className="space-y-6">
        <Link href="/dashboard/tutor">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Resumen
          </Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Pagos de la Familia</CardTitle>
            <CardDescription>Registro de pagos consolidados por mes para todos tus hijos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumnos Incluidos</TableHead>
                  <TableHead>Mes</TableHead>
                  <TableHead>Monto Familiar</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagosConsolidados.length > 0 ? (
                  pagosConsolidados.map((pago) => (
                    <TableRow key={pago.mes}>
                      <TableCell className="font-medium">{pago.alumnos.join(", ")}</TableCell>
                      <TableCell>{pago.mes}</TableCell>
                      <TableCell>${pago.monto.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={pago.estado === "pagado" ? "default" : "secondary"}>
                          {pago.estado === "pagado" ? "Pagado" : "Pendiente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No hay registros de pago.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

