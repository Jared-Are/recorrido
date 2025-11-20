import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import AuthListener  from "@/components/auth-listener" // <--- 1. IMPORTAMOS EL COMPONENTE
import "./globals.css"

const _geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: {
    default: 'Recorrido Escolar',
    template: '%s | Recorrido Escolar',
  },
  description: "Aplicación para la gestión de gastos de un recorrido escolar",
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${_geist.variable} ${_geistMono.variable} font-sans antialiased`}>
        {/* 2. AGREGAMOS EL ESCUCHA AQUÍ (Invisible pero funcional) */}
        <AuthListener />
        
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}