import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"], variable: "--font-geist" }) // <-- Añadí 'variable'
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" }) // <-- Añadí 'variable'

export const metadata: Metadata = {
  // title: "Recorrido Escolar", // <-- Cambiamos esto
  title: { // <-- Por esto (para títulos dinámicos)
    default: 'Recorrido Escolar',
    template: '%s | Recorrido Escolar',
  },
  description: "Aplicación para la gestión de gastos de un recorrido escolar",
  // generator: "v0.app", // <-- Esto no es necesario, lo quitamos.

  // --- ¡AQUÍ ESTÁ EL ICONO! ---
  // Ahora solo debes poner un archivo 'favicon.ico' o 'icon.png'
  // en tu carpeta 'public' (o en la raíz de 'app' si usas icon.tsx)
  icons: {
    icon: '/favicon.ico', // Puedes cambiar esto por '/icon.png' u otro.
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      {/* Aplicamos las fuentes que importaste al body */}
      <body className={`${_geist.variable} ${_geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
