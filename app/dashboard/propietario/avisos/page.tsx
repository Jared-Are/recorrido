"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Send } from "lucide-react"
import { mockAvisos, type Aviso } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

export default function AvisosPage() {
  const [avisos, setAvisos] = useState<Aviso[]>(mockAvisos)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    titulo: "",
    mensaje: "",
    destinatarios: [] as string[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newAviso: Aviso = {
      id: String(avisos.length + 1),
      ...formData,
      fecha: new Date().toISOString().split("T")[0],
    }

    setAvisos([newAviso, ...avisos])
    toast({
      title: "Aviso enviado",
      description: `El aviso ha sido enviado a ${formData.destinatarios.join(", ")}.`,
    })

    setDialogOpen(false)
    setFormData({ titulo: "", mensaje: "", destinatarios: [] })
  }

  const toggleDestinatario = (tipo: string) => {
    setFormData({
      ...formData,
      destinatarios: formData.destinatarios.includes(tipo)
        ? formData.destinatarios.filter((d) => d !== tipo)
        : [...formData.destinatarios, tipo],
    })
  }

  return (
    <DashboardLayout title="Gestión de Avisos">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Aviso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Enviar Aviso</DialogTitle>
                  <DialogDescription>Crea un comunicado para tutores o personal</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      placeholder="Ej: Inicio de clases"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mensaje">Mensaje *</Label>
                    <Textarea
                      id="mensaje"
                      placeholder="Escribe el mensaje del aviso..."
                      value={formData.mensaje}
                      onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Destinatarios *</Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="tutores"
                          checked={formData.destinatarios.includes("tutores")}
                          onCheckedChange={() => toggleDestinatario("tutores")}
                        />
                        <label htmlFor="tutores" className="text-sm cursor-pointer">
                          Tutores
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="personal"
                          checked={formData.destinatarios.includes("personal")}
                          onCheckedChange={() => toggleDestinatario("personal")}
                        />
                        <label htmlFor="personal" className="text-sm cursor-pointer">
                          Personal
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={formData.destinatarios.length === 0}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Aviso
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {avisos.map((aviso) => (
            <Card key={aviso.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{aviso.titulo}</CardTitle>
                    <CardDescription className="mt-1">
                      {new Date(aviso.fecha).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  <div className="text-xs text-muted-foreground">Para: {aviso.destinatarios.join(", ")}</div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{aviso.mensaje}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
