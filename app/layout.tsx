import type React from "react"
import type { Metadata, Viewport } from "next" 
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import AuthListener  from "@/components/auth-listener" 
import SecurityGuard from "@/components/security-guard" // Importación por defecto (sin llaves)
import RealTimeListener from "@/components/real-time-listener" // El oído para WebSockets
import "./globals.css"

const _geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: {
    default: 'Recorrido Escolar',
    template: '%s | Recorrido Escolar',
  },
  description: "Aplicación para la gestión de gastos de un recorrido escolar",
  manifest: "/manifest.json", 
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${_geist.variable} ${_geistMono.variable} font-sans antialiased`}>
        
        {/* Componentes invisibles de lógica global */}
        <SecurityGuard />
        <AuthListener />
        <RealTimeListener />
        
        {/* Contenido de la página */}
        {children}
        
        {/* Utilidades visuales */}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}