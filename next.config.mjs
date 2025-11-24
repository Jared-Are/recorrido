import withPWAInit from "@ducanh2912/next-pwa";

// Inicializamos el plugin PWA
const withPWA = withPWAInit({
  dest: "public",       // Donde se guardan los archivos generados
  cacheOnFrontEndNav: true, // Hace que la navegación se sienta instantánea
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true, // Recargar si vuelve internet
  disable: process.env.NODE_ENV === "development", // Desactivar en modo desarrollo para que no moleste
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔒 SEGURIDAD: Oculta el código fuente en el navegador
  productionBrowserSourceMaps: false, 

  // 👇 Permite probar desde tu celular/red local
  experimental: {
    allowedDevOrigins: ['localhost:3000', '192.168.1.7:3000'], 
  },

  // --- CONFIGURACIONES ORIGINALES ---
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // Vital para Render/Vercel sin costo extra
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

// Exportamos la configuración envuelta en withPWA
export default withPWA(nextConfig);