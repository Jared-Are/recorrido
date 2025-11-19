"use client";
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

// Componente interno que usa useSearchParams
function ActivarCuentaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token'); // Leemos el token de la URL

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return alert("Las contraseñas no coinciden");
    if (password.length < 6) return alert("La contraseña es muy corta");

    try {
      // CAMBIO IMPORTANTE AQUÍ:
      // 1. Usamos la variable de entorno para que funcione en producción (Render)
      // 2. Apuntamos a '/users/activar' que es donde pusimos el método en el Backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      await axios.post(`${apiUrl}/users/activar`, {
        token,
        password
      });
      
      alert("¡Cuenta activada! Ahora inicia sesión.");
      router.push('/login');
    } catch (error) {
      alert("Error: Token inválido o expirado.");
    }
  };

  if (!token) return <p className="text-red-500 text-center mt-10">Enlace inválido.</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-xl font-bold mb-4 text-center">Activa tu Cuenta</h1>
        <p className="mb-4 text-sm text-gray-600 text-center">Crea tu contraseña para acceder al Recorrido Escolar.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="password" 
            placeholder="Nueva Contraseña" 
            className="border p-2 rounded"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Confirmar Contraseña" 
            className="border p-2 rounded"
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Activar y Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

// Componente principal que envuelve con Suspense
export default function ActivarPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Cargando...</div>}>
      <ActivarCuentaForm />
    </Suspense>
  );
}